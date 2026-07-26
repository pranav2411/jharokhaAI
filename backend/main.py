from typing import List, Optional, Dict, Any
import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, Query, status, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, and_
from database import engine, init_db, get_session
import models
import ai_service
import sandbox

app = FastAPI(title="Jharokha Artisan Marketplace API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure persistent or ephemeral uploads folder depending on Render storage mount
import shutil

if os.path.exists("/data"):
    upload_dir = "/data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    # Copy default studio images to persistent storage if needed
    repo_uploads = "uploads"
    if os.path.exists(repo_uploads):
        for filename in os.listdir(repo_uploads):
            src_path = os.path.join(repo_uploads, filename)
            dest_path = os.path.join(upload_dir, filename)
            if os.path.isfile(src_path) and not os.path.exists(dest_path):
                try:
                    shutil.copy(src_path, dest_path)
                    print(f"Copied studio asset {filename} to persistent storage.")
                except Exception as e:
                    print(f"Failed to copy studio asset {filename}: {e}")
else:
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=upload_dir), name="static")


@app.on_event("startup")
def on_startup():
    init_db()
    # Auto-seed if database is unseeded
    from sqlmodel import Session, select
    from seed import seed_data
    import models
    try:
        with Session(engine) as session:
            if not session.exec(select(models.Category)).first():
                print("Database is empty. Auto-seeding default categories, users, and products...")
                seed_data()
    except Exception as e:
        print(f"Error during database auto-seeding: {e}")

# --- Pydantic Request Schemas ---
from pydantic import BaseModel
import hashlib
import json
import urllib.request
import urllib.error

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_google_token(token: str) -> dict:
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data
    except urllib.error.HTTPError as e:
        raise ValueError("Invalid Google credentials/token.") from e
    except Exception as e:
        raise ValueError(f"Failed to verify Google token: {str(e)}") from e

class UserRegister(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "customer"
    accept_terms: bool

class UserLogin(BaseModel):
    email: str
    password: str

class PhoneLoginRequest(BaseModel):
    phone: str
    code: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    email: str
    name: str
    credential: Optional[str] = None

class FeaturedProductsRequest(BaseModel):
    product_ids: List[int]

class CreateAdminRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str

class UserProfileUpdate(BaseModel):
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    shipping_address: Optional[str] = None
    password: Optional[str] = None

class ArtisanProfileUpdate(BaseModel):
    artisan_id: int
    bio: str
    craft_type: str
    city: str

class GenerateCopyRequest(BaseModel):
    type: str  # "description" or "bio"
    raw_details: str
    category: Optional[str] = None

class CustomizationFeasibilityRequest(BaseModel):
    product_title: str
    product_desc: str
    custom_request: str

class CallbackRequestPayload(BaseModel):
    user_id: Optional[int] = None
    user_name: str
    phone: str

# --- Users & Auth (Real Authentication & Simulation) ---

@app.post("/api/auth/register", response_model=models.User)
def register_user(req: UserRegister, session: Session = Depends(get_session)):
    if not req.accept_terms:
        raise HTTPException(status_code=400, detail="You must accept the terms and conditions.")
    
    # Check if email exists
    statement = select(models.User).where(models.User.email == req.email.strip().lower())
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Check if the registered email is the primary admin email
    requested_role = req.role if req.role in ["customer", "artisan"] else "customer"
    role = "admin" if req.email.strip().lower() in ["pranavkh2411@gmail.com", "pranavkh2411@gmial.com"] else requested_role
    
    db_user = models.User(
        name=req.name,
        email=req.email.strip().lower(),
        phone=req.phone,
        password_hash=hash_password(req.password),
        role=role
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    if role == "artisan":
        db_artisan = models.Artisan(
            user_id=db_user.id,
            bio="Traditional artisan preserving handcrafted heritages.",
            craft_type="Handicrafts",
            city="Jaipur",
            rating=5.0,
            photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
            is_verified=False
        )
        session.add(db_artisan)
        session.commit()
        session.refresh(db_user)

    return db_user

@app.post("/api/auth/login", response_model=models.User)
def login_user(req: UserLogin, session: Session = Depends(get_session)):
    statement = select(models.User).where(models.User.email == req.email.strip().lower())
    db_user = session.exec(statement).first()
    if not db_user or db_user.password_hash != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return db_user

@app.post("/api/auth/login-phone")
def login_phone(req: PhoneLoginRequest, session: Session = Depends(get_session)):
    clean_phone = req.phone.strip()
    
    # Find user by phone
    statement = select(models.User).where(models.User.phone == clean_phone)
    db_user = session.exec(statement).first()
    
    # If code is not provided, we simulate sending the code
    if not req.code:
        # Return verification code prompt
        return {
            "otp_sent": True,
            "message": f"Verification code sent to {clean_phone}! (For this demo, please use code 123456)"
        }
    
    # Verify code (for this demo, use 123456)
    if req.code != "123456":
        raise HTTPException(status_code=400, detail="Invalid verification code. Please use 123456")
        
    if not db_user:
        # Create a new user with this phone number
        email = f"phone_{clean_phone.replace('+', '')}@jharokha.in"
        db_user = models.User(
            name=f"User {clean_phone[-4:]}",
            email=email,
            phone=clean_phone,
            role="customer"
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
    return db_user

@app.post("/api/auth/login-google", response_model=models.User)
def login_google(req: GoogleLoginRequest, session: Session = Depends(get_session)):
    email_to_use = req.email.strip().lower()
    name_to_use = req.name
    
    if req.credential:
        try:
            payload = verify_google_token(req.credential)
            email_to_use = payload.get("email", "").strip().lower()
            name_to_use = payload.get("name", name_to_use)
            if not email_to_use:
                raise HTTPException(status_code=400, detail="Google token does not contain a valid email.")
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))

    statement = select(models.User).where(models.User.email == email_to_use)
    db_user = session.exec(statement).first()
    
    if not db_user:
        role = "admin" if email_to_use in ["pranavkh2411@gmail.com", "pranavkh2411@gmial.com"] else "customer"
        db_user = models.User(
            name=name_to_use,
            email=email_to_use,
            role=role
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
    return db_user

# Get specific user
@app.get("/api/users/{user_id}", response_model=models.User)
def get_user(user_id: int, session: Session = Depends(get_session)):
    db_user = session.get(models.User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Create user / Artisan signup (retained for backward compatibility)
@app.post("/api/users", response_model=models.User)
def create_user(user: models.User, session: Session = Depends(get_session)):
    statement = select(models.User).where(models.User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        return existing_user
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# --- Categories ---
@app.get("/api/categories", response_model=List[models.Category])
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(models.Category)).all()

@app.post("/api/categories", response_model=models.Category)
def create_category(category: models.Category, session: Session = Depends(get_session)):
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

# --- Artisans ---
@app.get("/api/artisans", response_model=List[models.Artisan])
def get_artisans(session: Session = Depends(get_session)):
    # Fetch all artisans and join their users
    return session.exec(select(models.Artisan)).all()

@app.get("/api/artisans/{artisan_id}")
def get_artisan(artisan_id: int, session: Session = Depends(get_session)):
    artisan = session.get(models.Artisan, artisan_id)
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    # Returns artisan profile, user info, and their products
    statement = select(models.Product).where(models.Product.artisan_id == artisan_id)
    products = session.exec(statement).all()
    
    user = session.get(models.User, artisan.user_id)
    
    return {
        "id": artisan.id,
        "bio": artisan.bio,
        "craft_type": artisan.craft_type,
        "city": artisan.city,
        "rating": artisan.rating,
        "photo_url": artisan.photo_url,
        "is_verified": artisan.is_verified,
        "user": user,
        "products": products
    }

@app.post("/api/artisans", response_model=models.Artisan)
def create_artisan(artisan: models.Artisan, session: Session = Depends(get_session)):
    # Make sure user exists and set user role to artisan
    user = session.get(models.User, artisan.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "artisan"
    session.add(user)
    
    session.add(artisan)
    session.commit()
    session.refresh(artisan)
    return artisan

# --- Products ---
@app.get("/api/products")
def get_products(
    category_slug: Optional[str] = None,
    is_customizable: Optional[bool] = None,
    query: Optional[str] = None,
    artisan_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    statement = select(models.Product)
    filters = []
    
    if category_slug:
        cat_statement = select(models.Category).where(models.Category.slug == category_slug)
        category = session.exec(cat_statement).first()
        if category:
            filters.append(models.Product.category_id == category.id)
            
    if is_customizable is not None:
        filters.append(models.Product.is_customizable == is_customizable)
        
    if query:
        filters.append(models.Product.title.like(f"%{query}%"))

    if artisan_id:
        filters.append(models.Product.artisan_id == artisan_id)
        
    # Only active products by default for frontend catalog
    filters.append(models.Product.status == "active")
    
    if filters:
        statement = statement.where(and_(*filters))
        
    products = session.exec(statement).all()
    
    # Hydrate with artisan user names and categories
    results = []
    for p in products:
        artisan = session.get(models.Artisan, p.artisan_id)
        artisan_user = session.get(models.User, artisan.user_id) if artisan else None
        category = session.get(models.Category, p.category_id)
        
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "base_price": p.base_price,
            "is_customizable": p.is_customizable,
            "is_featured": p.is_featured,
            "stock_qty": p.stock_qty,
            "images": p.images,
            "status": p.status,
            "artisan_name": artisan_user.name if artisan_user else "Unknown Artisan",
            "artisan_id": p.artisan_id,
            "artisan_rating": artisan.rating if artisan else 5.0,
            "category_name": category.name if category else "General",
            "category_slug": category.slug if category else "general"
        })
        
    return results

@app.get("/api/products/featured")
def get_featured_products(session: Session = Depends(get_session)):
    statement = select(models.Product).where(
        and_(models.Product.is_featured == True, models.Product.status == "active")
    )
    featured = session.exec(statement).all()
    
    if len(featured) < 4:
        statement_other = select(models.Product).where(
            and_(models.Product.is_featured == False, models.Product.status == "active")
        ).limit(4 - len(featured))
        other_active = session.exec(statement_other).all()
        featured.extend(other_active)
        
    featured = featured[:4]
    
    results = []
    for p in featured:
        artisan = session.get(models.Artisan, p.artisan_id)
        artisan_user = session.get(models.User, artisan.user_id) if artisan else None
        category = session.get(models.Category, p.category_id)
        
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "base_price": p.base_price,
            "is_customizable": p.is_customizable,
            "is_featured": p.is_featured,
            "stock_qty": p.stock_qty,
            "images": p.images,
            "status": p.status,
            "artisan_name": artisan_user.name if artisan_user else "Unknown Artisan",
            "artisan_id": p.artisan_id,
            "artisan_rating": artisan.rating if artisan else 5.0,
            "category_name": category.name if category else "General",
            "category_slug": category.slug if category else "general"
        })
        
    return results

@app.get("/api/products/{product_id}")
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    artisan = session.get(models.Artisan, product.artisan_id)
    artisan_user = session.get(models.User, artisan.user_id) if artisan else None
    category = session.get(models.Category, product.category_id)
    
    # Fetch options
    options_statement = select(models.CustomizationOption).where(models.CustomizationOption.product_id == product_id)
    options = session.exec(options_statement).all()
    
    # Fetch reviews
    reviews_statement = select(models.Review).where(models.Review.product_id == product_id)
    reviews = session.exec(reviews_statement).all()
    reviews_hydrated = []
    for r in reviews:
        user = session.get(models.User, r.user_id)
        reviews_hydrated.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "images": r.images,
            "user_name": user.name if user else "Anonymous",
            "created_at": r.created_at
        })
        
    return {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "base_price": product.base_price,
        "is_customizable": product.is_customizable,
        "stock_qty": product.stock_qty,
        "images": product.images,
        "status": product.status,
        "pricing_formula": product.pricing_formula,
        "quality_rating": product.quality_rating,
        "price_fairness": product.price_fairness,
        "artisan": {
            "id": artisan.id if artisan else None,
            "name": artisan_user.name if artisan_user else "Unknown Artisan",
            "bio": artisan.bio if artisan else "",
            "craft_type": artisan.craft_type if artisan else "",
            "city": artisan.city if artisan else "",
            "rating": artisan.rating if artisan else 5.0,
            "photo_url": artisan.photo_url if artisan else None,
            "is_verified": artisan.is_verified if artisan else False
        },
        "category": {
            "id": category.id if category else None,
            "name": category.name if category else "General",
            "slug": category.slug if category else "general",
            "jharokha_style": category.jharokha_style if category else "default-jharokha"
        },
        "customization_options": options,
        "reviews": reviews_hydrated
    }

@app.post("/api/products")
def create_product(
    product_data: Dict[str, Any], 
    session: Session = Depends(get_session)
):
    # Separate CustomizationOptions if present
    options_data = product_data.pop("customization_options", [])
    
    new_product = models.Product(**product_data)
    session.add(new_product)
    session.commit()
    session.refresh(new_product)
    
    # Create customization options
    for opt in options_data:
        db_opt = models.CustomizationOption(
            product_id=new_product.id,
            option_name=opt["option_name"],
            option_type=opt["option_type"],
            choices=opt.get("choices", []),
            price_delta=opt.get("price_delta", 0.0)
        )
        session.add(db_opt)
        
    if options_data:
        session.commit()
        
    return {"message": "Product created successfully", "id": new_product.id}

# --- Cart ---
@app.get("/api/cart/{user_id}")
def get_cart(user_id: int, session: Session = Depends(get_session)):
    statement = select(models.CartItem).where(models.CartItem.user_id == user_id)
    cart_items = session.exec(statement).all()
    
    hydrated = []
    for item in cart_items:
        product = session.get(models.Product, item.product_id)
        if product:
            artisan = session.get(models.Artisan, product.artisan_id)
            artisan_user = session.get(models.User, artisan.user_id) if artisan else None
            
            hydrated.append({
                "id": item.id,
                "product_id": item.product_id,
                "qty": item.qty,
                "selected_customizations": item.selected_customizations,
                "product": {
                    "id": product.id,
                    "title": product.title,
                    "base_price": product.base_price,
                    "images": product.images,
                    "artisan_name": artisan_user.name if artisan_user else "Unknown Artisan"
                }
            })
    return hydrated

@app.post("/api/cart")
def add_to_cart(cart_item: models.CartItem, session: Session = Depends(get_session)):
    # Check if item with same product and exact same customizations already exists
    statement = select(models.CartItem).where(
        and_(
            models.CartItem.user_id == cart_item.user_id,
            models.CartItem.product_id == cart_item.product_id
        )
    )
    items = session.exec(statement).all()
    
    # Compare selected customizations to update qty if matching
    for existing in items:
        if existing.selected_customizations == cart_item.selected_customizations:
            existing.qty += cart_item.qty
            session.add(existing)
            session.commit()
            session.refresh(existing)
            return existing
            
    # Otherwise, add as a new row
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item

@app.put("/api/cart/{cart_item_id}")
def update_cart_item(cart_item_id: int, data: Dict[str, Any], session: Session = Depends(get_session)):
    item = session.get(models.CartItem, cart_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if "qty" in data:
        item.qty = data["qty"]
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@app.delete("/api/cart/{cart_item_id}")
def remove_from_cart(cart_item_id: int, session: Session = Depends(get_session)):
    item = session.get(models.CartItem, cart_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    session.delete(item)
    session.commit()
    return {"message": "Item removed"}

# --- Orders & Checkout ---
@app.post("/api/orders")
def create_order(
    payload: Dict[str, Any], 
    session: Session = Depends(get_session)
):
    user_id = payload["user_id"]
    shipping_address = payload["shipping_address"]
    total = payload["total"]
    
    # 1. Fetch current cart
    cart_statement = select(models.CartItem).where(models.CartItem.user_id == user_id)
    cart_items = session.exec(cart_statement).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    # 2. Create Order
    db_order = models.Order(
        user_id=user_id,
        total=total,
        status="paid",  # Mocked payment successful immediately
        shipping_address=shipping_address
    )
    session.add(db_order)
    session.commit()  # Committing generates the order ID
    session.refresh(db_order)
    
    # 3. Create OrderItems from cart
    for item in cart_items:
        product = session.get(models.Product, item.product_id)
        if not product:
            continue
            
        # Recalculate price_at_purchase including customization add-ons if any
        price = product.base_price
        
        # Deduct stock
        product.stock_qty = max(0, product.stock_qty - item.qty)
        session.add(product)
        
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            qty=item.qty,
            customizations=item.selected_customizations,
            price_at_purchase=price
        )
        session.add(db_item)
        session.delete(item)  # Clear cart item
        
    session.commit()
    return {"message": "Order placed successfully", "order_id": db_order.id}

@app.get("/api/orders/user/{user_id}")
def get_user_orders(user_id: int, session: Session = Depends(get_session)):
    statement = select(models.Order).where(models.Order.user_id == user_id).order_by(models.Order.created_at.desc())
    orders = session.exec(statement).all()
    
    hydrated = []
    for order in orders:
        items_statement = select(models.OrderItem).where(models.OrderItem.order_id == order.id)
        items = session.exec(items_statement).all()
        
        items_hydrated = []
        for it in items:
            prod = session.get(models.Product, it.product_id)
            items_hydrated.append({
                "id": it.id,
                "qty": it.qty,
                "customizations": it.customizations,
                "price_at_purchase": it.price_at_purchase,
                "product_title": prod.title if prod else "Deleted Product",
                "product_image": prod.images[0] if prod and prod.images else None
            })
            
        hydrated.append({
            "id": order.id,
            "total": order.total,
            "status": order.status,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at,
            "items": items_hydrated
        })
    return hydrated

# --- Reviews ---
@app.post("/api/reviews", response_model=models.Review)
def create_review(review: models.Review, session: Session = Depends(get_session)):
    session.add(review)
    session.commit()
    session.refresh(review)
    
    # Update Artisan average rating
    product = session.get(models.Product, review.product_id)
    if product:
        artisan = session.get(models.Artisan, product.artisan_id)
        if artisan:
            # Simple ratings calculation: average of all reviews for all products of this artisan
            prod_statement = select(models.Product.id).where(models.Product.artisan_id == artisan.id)
            artisan_product_ids = session.exec(prod_statement).all()
            
            if artisan_product_ids:
                reviews_statement = select(models.Review.rating).where(models.Review.product_id.in_(artisan_product_ids))
                ratings = session.exec(reviews_statement).all()
                if ratings:
                    artisan.rating = round(sum(ratings) / len(ratings), 1)
                    session.add(artisan)
                    session.commit()
                    
    return review

# --- Admin API Routes ---

@app.post("/api/admin/upload")
def upload_image(request: Request, file: UploadFile = File(...)):
    active_dir = "/data/uploads" if os.path.exists("/data") else "uploads"
    os.makedirs(active_dir, exist_ok=True)
    
    file_path = os.path.join(active_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_url = str(request.base_url).rstrip("/")
    return {"url": f"{base_url}/static/{file.filename}"}


@app.put("/api/admin/products/{product_id}")
def update_product(
    product_id: int,
    product_data: Dict[str, Any],
    session: Session = Depends(get_session)
):
    product = session.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Update standard fields
    for key, value in product_data.items():
        if key not in ["customization_options", "id", "artisan", "category"] and hasattr(product, key):
            setattr(product, key, value)
            
    session.add(product)
    
    # Update customization options if provided
    if "customization_options" in product_data:
        # Delete old options
        old_opts = session.exec(select(models.CustomizationOption).where(models.CustomizationOption.product_id == product_id)).all()
        for opt in old_opts:
            session.delete(opt)
            
        # Add new options
        for opt in product_data["customization_options"]:
            db_opt = models.CustomizationOption(
                product_id=product_id,
                option_name=opt["option_name"],
                option_type=opt["option_type"],
                choices=opt.get("choices", []),
                price_delta=opt.get("price_delta", 0.0)
            )
            session.add(db_opt)
            
    session.commit()
    return {"message": "Product updated successfully"}

@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted successfully"}

@app.put("/api/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: Dict[str, Any],
    session: Session = Depends(get_session)
):
    order = session.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    status = payload.get("status")
    if status:
        order.status = status
        session.add(order)
        session.commit()
    return {"message": "Order status updated successfully", "status": order.status}

@app.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(models.Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    session.delete(review)
    session.commit()
    return {"message": "Review deleted successfully"}

@app.get("/api/admin/payments")
def get_payments_analytics(session: Session = Depends(get_session)):
    # Simple report for orders and earnings
    orders = session.exec(select(models.Order)).all()
    total_sales = sum(o.total for o in orders)
    
    # Generate list of transaction lines
    lines = []
    for o in orders:
        user = session.get(models.User, o.user_id)
        lines.append({
            "order_id": o.id,
            "buyer_name": user.name if user else "Anonymous",
            "amount": o.total,
            "status": o.status,
            "created_at": o.created_at,
            "reference": f"TXN-MOCK-{o.id * 791}"
        })
        
    return {
        "total_sales": total_sales,
        "total_orders": len(orders),
        "transactions": lines
    }

@app.get("/api/admin/reviews")
def get_all_reviews(session: Session = Depends(get_session)):
    reviews = session.exec(select(models.Review)).all()
    hydrated = []
    for r in reviews:
        user = session.get(models.User, r.user_id)
        product = session.get(models.Product, r.product_id)
        hydrated.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_name": user.name if user else "Anonymous",
            "product_title": product.title if product else "Deleted Product"
        })
    return hydrated

@app.get("/api/admin/orders")
def get_all_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(models.Order)).all()
    hydrated = []
    for o in orders:
        user = session.get(models.User, o.user_id)
        
        items_statement = select(models.OrderItem).where(models.OrderItem.order_id == o.id)
        items = session.exec(items_statement).all()
        
        items_hydrated = []
        for it in items:
            prod = session.get(models.Product, it.product_id)
            items_hydrated.append({
                "id": it.id,
                "qty": it.qty,
                "customizations": it.customizations,
                "price_at_purchase": it.price_at_purchase,
                "product_title": prod.title if prod else "Deleted Product"
            })
            
        hydrated.append({
            "id": o.id,
            "total": o.total,
            "status": o.status,
            "shipping_address": o.shipping_address,
            "created_at": o.created_at,
            "buyer_name": user.name if user else "Anonymous",
            "items": items_hydrated
        })
    return hydrated

# --- Admin User Management & Featured Products Selection ---

@app.get("/api/admin/users")
def get_all_users(session: Session = Depends(get_session)):
    return session.exec(select(models.User)).all()

@app.post("/api/admin/create-admin", response_model=models.User)
def create_admin(req: CreateAdminRequest, session: Session = Depends(get_session)):
    statement = select(models.User).where(models.User.email == req.email.strip().lower())
    existing_user = session.exec(statement).first()
    if existing_user:
        existing_user.role = "admin"
        session.add(existing_user)
        session.commit()
        session.refresh(existing_user)
        return existing_user
        
    db_user = models.User(
        name=req.name,
        email=req.email.strip().lower(),
        phone=req.phone,
        password_hash=hash_password(req.password),
        role="admin"
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.put("/api/admin/featured-products")
def set_featured_products(req: FeaturedProductsRequest, session: Session = Depends(get_session)):
    if len(req.product_ids) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 products must be selected.")
        
    # Unfeature all products
    all_products = session.exec(select(models.Product)).all()
    for prod in all_products:
        prod.is_featured = (prod.id in req.product_ids)
        session.add(prod)
        
    session.commit()
    return {"success": True, "message": "Top 4 featured products updated."}

@app.put("/api/users/profile", response_model=models.User)
def update_user_profile(req: UserProfileUpdate, session: Session = Depends(get_session)):
    user = session.get(models.User, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check duplicate email
    if req.email.strip().lower() != user.email:
        existing = session.exec(select(models.User).where(models.User.email == req.email.strip().lower())).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered by another account.")
            
    user.name = req.name
    user.email = req.email.strip().lower()
    user.phone = req.phone
    user.shipping_address = req.shipping_address
    if req.password and req.password.strip():
        user.password_hash = hash_password(req.password)
        
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.put("/api/artisans/profile", response_model=models.Artisan)
def update_artisan_profile(req: ArtisanProfileUpdate, session: Session = Depends(get_session)):
    artisan = session.get(models.Artisan, req.artisan_id)
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan profile not found")
    artisan.bio = req.bio
    artisan.craft_type = req.craft_type
    artisan.city = req.city
    session.add(artisan)
    session.commit()
    session.refresh(artisan)
    return artisan

@app.post("/api/ai/generate-copy")
def api_generate_copy(req: GenerateCopyRequest):
    copy = ai_service.generate_artisan_copy(req.type, req.raw_details, req.category)
    return {"copy": copy}

@app.post("/api/ai/check-feasibility")
def api_check_feasibility(req: CustomizationFeasibilityRequest):
    res = ai_service.check_customization_feasibility(req.product_title, req.product_desc, req.custom_request)
    return res

@app.post("/api/ai/replace-backdrop")
def api_replace_backdrop(
    request: Request,
    category: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    cat = category.lower()
    if "pottery" in cat or "ceramic" in cat:
        url = "/static/studio_pottery.png"
    elif "wood" in cat or "carving" in cat or "furniture" in cat:
        url = "/static/studio_woodwork.png"
    elif "textile" in cat or "silk" in cat or "weave" in cat or "scarf" in cat or "cloth" in cat:
        url = "/static/studio_textile.png"
    else:
        url = "/static/studio_metal.png"
        
    base_url = str(request.base_url).rstrip("/")
    return {
        "success": True,
        "image_url": f"{base_url}{url}",
        "reason": f"AI backdrop replacement completed successfully for {category} category."
    }

@app.post("/api/chatbot/callback-request", response_model=models.CallbackRequest)
def create_callback_request(req: CallbackRequestPayload, session: Session = Depends(get_session)):
    db_req = models.CallbackRequest(
        user_id=req.user_id,
        user_name=req.user_name,
        phone=req.phone,
        status="pending"
    )
    session.add(db_req)
    session.commit()
    session.refresh(db_req)
    return db_req

@app.get("/api/admin/callback-requests")
def get_callback_requests(session: Session = Depends(get_session)):
    return session.exec(select(models.CallbackRequest).order_by(models.CallbackRequest.created_at.desc())).all()

@app.put("/api/admin/callback-requests/{id}")
def resolve_callback_request(id: int, session: Session = Depends(get_session)):
    db_req = session.get(models.CallbackRequest, id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Callback request not found")
    db_req.status = "completed"
    session.add(db_req)
    session.commit()
    session.refresh(db_req)
    return db_req

# --- AI Integration Endpoints ---

@app.post("/api/ai/verify-seller")
def api_verify_seller(
    artisan_id: int = Form(...),
    guild_id: UploadFile = File(...),
    aadhaar: UploadFile = File(...),
    business_reg: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    artisan = session.get(models.Artisan, artisan_id)
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    
    # Save the files locally to uploads folder
    os.makedirs("uploads", exist_ok=True)
    
    def save_and_read(doc: UploadFile):
        file_path = os.path.join("uploads", f"artisan_{artisan_id}_{doc.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(doc.file, buffer)
        with open(file_path, "rb") as f:
            return f.read()

    guild_bytes = save_and_read(guild_id)
    aadhaar_bytes = save_and_read(aadhaar)
    business_bytes = save_and_read(business_reg)
        
    # Call AI verifier with all 3 files
    verification_res = ai_service.verify_artisan_documents(
        guild_bytes, guild_id.filename,
        aadhaar_bytes, aadhaar.filename,
        business_bytes, business_reg.filename
    )
    
    if verification_res.get("is_verified", False):
        artisan.is_verified = True
        artisan.verification_document = f"/static/artisan_{artisan_id}_{guild_id.filename}"
        session.add(artisan)
        session.commit()
        session.refresh(artisan)
        
    return verification_res

@app.post("/api/ai/suggest-product")
def api_suggest_product(
    description: str = Form(...),
    requested_price: float = Form(...),
    image: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    # Save image file locally
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", f"temp_{image.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    with open(file_path, "rb") as f:
        img_bytes = f.read()
        
    # Process with Gemini
    ai_suggestions = ai_service.suggest_and_verify_product(img_bytes, description, requested_price)
    
    # Keep the path of the uploaded file for return
    ai_suggestions["temp_image_url"] = f"/static/temp_{image.filename}"
    return ai_suggestions

class MarketingRequestPayload(BaseModel):
    product_id: int

@app.post("/api/ai/marketing")
def api_generate_marketing(payload: MarketingRequestPayload, session: Session = Depends(get_session)):
    product = session.get(models.Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    campaign = ai_service.generate_marketing_campaign(product.title, product.description, product.base_price)
    return campaign

class ChatRequestPayload(BaseModel):
    chat_history: List[Dict[str, str]]
    user_message: str
    product_id: int

@app.post("/api/ai/chat")
def api_chat_assistant(payload: ChatRequestPayload, session: Session = Depends(get_session)):
    product = session.get(models.Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    artisan = session.get(models.Artisan, product.artisan_id)
    artisan_user = session.get(models.User, artisan.user_id) if artisan else None
    
    product_dict = {
        "title": product.title,
        "description": product.description,
        "base_price": product.base_price,
        "customization_options": [],
        "artisan": {
            "name": artisan_user.name if artisan_user else "Unknown Artisan"
        }
    }
    
    # Fetch customization options structure for prompt
    options = session.exec(select(models.CustomizationOption).where(models.CustomizationOption.product_id == product.id)).all()
    for opt in options:
        product_dict["customization_options"].append({
            "option_name": opt.option_name,
            "option_type": opt.option_type,
            "choices": opt.choices
        })
        
    res = ai_service.chat_with_artisan_assistant(payload.chat_history, payload.user_message, product_dict)
    
    # If custom specs are detected by AI, compute the custom price in the subprocess sandbox
    custom_price = product.base_price
    if res.get("customization_detected", False) and res.get("customizations"):
        if product.pricing_formula:
            sandbox_res = sandbox.run_in_sandbox(product.pricing_formula, res["customizations"], product.base_price)
            if sandbox_res["success"]:
                custom_price = sandbox_res["result"]
            else:
                # Fallback to standard price computation (price additions) if sandbox fails
                print(f"Chatbot sandbox computation failed: {sandbox_res['error']}")
                for opt in options:
                    selection = res["customizations"].get(opt.option_name)
                    if selection and isinstance(opt.choices, list):
                        for choice in opt.choices:
                            if isinstance(choice, dict) and choice.get("name") == selection:
                                custom_price += float(choice.get("price", 0.0))
        else:
            # Traditional price check
            for opt in options:
                selection = res["customizations"].get(opt.option_name)
                if selection and isinstance(opt.choices, list):
                    for choice in opt.choices:
                        if isinstance(choice, dict) and choice.get("name") == selection:
                            custom_price += float(choice.get("price", 0.0))
                            
    res["custom_price"] = custom_price
    return res

class TestFormulaPayload(BaseModel):
    instructions: str
    test_customizations: Dict[str, Any]
    base_price: float

@app.post("/api/ai/sandbox/test-formula")
def api_test_formula(payload: TestFormulaPayload):
    res = sandbox.validate_and_heal_formula(
        payload.instructions,
        payload.test_customizations,
        payload.base_price
    )
    return res

# --- Order Pickup and Admin Routing ---

@app.put("/api/orders/{order_id}/pickup")
def mark_order_ready_for_pickup(order_id: int, session: Session = Depends(get_session)):
    order = session.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "ready_for_pickup"
    session.add(order)
    session.commit()
    session.refresh(order)
    return {"message": "Order marked ready for pickup. Admin notified.", "status": order.status}

@app.get("/api/admin/notifications")
def get_pickup_notifications(session: Session = Depends(get_session)):
    # Returns all orders that are ready_for_pickup or active courier states
    statement = select(models.Order).where(models.Order.status.in_(["ready_for_pickup", "out_for_delivery"]))
    orders = session.exec(statement).all()
    
    hydrated = []
    for order in orders:
        items_statement = select(models.OrderItem).where(models.OrderItem.order_id == order.id)
        items = session.exec(items_statement).all()
        
        items_hydrated = []
        for it in items:
            prod = session.get(models.Product, it.product_id)
            items_hydrated.append({
                "id": it.id,
                "qty": it.qty,
                "customizations": it.customizations,
                "price_at_purchase": it.price_at_purchase,
                "product_title": prod.title if prod else "Deleted Product"
            })
            
        hydrated.append({
            "id": order.id,
            "total": order.total,
            "status": order.status,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at,
            "items": items_hydrated
        })
    return hydrated

@app.get("/api/admin/unverified-artisans")
def get_unverified_artisans(session: Session = Depends(get_session)):
    statement = select(models.Artisan).where(models.Artisan.is_verified == False)
    artisans = session.exec(statement).all()
    hydrated = []
    for art in artisans:
        user = session.get(models.User, art.user_id)
        hydrated.append({
            "id": art.id,
            "name": user.name if user else "Unknown",
            "bio": art.bio,
            "craft_type": art.craft_type,
            "city": art.city,
            "verification_document": art.verification_document
        })
    return hydrated

@app.put("/api/admin/artisans/{artisan_id}/verify")
def admin_verify_artisan(artisan_id: int, session: Session = Depends(get_session)):
    artisan = session.get(models.Artisan, artisan_id)
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    artisan.is_verified = True
    session.add(artisan)
    session.commit()
    session.refresh(artisan)
    return {"message": "Artisan verified successfully", "is_verified": artisan.is_verified}


