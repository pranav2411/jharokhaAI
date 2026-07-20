from typing import List, Optional, Dict, Any
import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, Query, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, and_
from database import engine, init_db, get_session
import models

app = FastAPI(title="Jharokha Artisan Marketplace API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder is served if it exists
if not os.path.exists("uploads"):
    os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.on_event("startup")
def on_startup():
    init_db()

# --- Users & Auth (Mocked for current user) ---
@app.get("/api/users/me", response_model=models.User)
def get_current_user(session: Session = Depends(get_session)):
    # Default to user ID 1 or create one if none exists (for dev environment)
    db_user = session.get(models.User, 1)
    if not db_user:
        db_user = models.User(
            id=1,
            name="Aarav Sharma",
            email="aarav@jharokha.in",
            role="customer",
            phone="+919876543210"
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

# Create user / Artisan signup
@app.post("/api/users", response_model=models.User)
def create_user(user: models.User, session: Session = Depends(get_session)):
    # Check if email exists
    statement = select(models.User).where(models.User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        return existing_user  # Auto login/reuse for demo
    
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
        "artisan": {
            "id": artisan.id if artisan else None,
            "name": artisan_user.name if artisan_user else "Unknown Artisan",
            "bio": artisan.bio if artisan else "",
            "craft_type": artisan.craft_type if artisan else "",
            "city": artisan.city if artisan else "",
            "rating": artisan.rating if artisan else 5.0,
            "photo_url": artisan.photo_url if artisan else None
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
def upload_image(file: UploadFile = File(...)):
    # Try to find Next.js frontend directory to save files directly
    paths_to_try = [
        os.path.join("..", "frontend", "public", "uploads"),
        os.path.join("frontend", "public", "uploads"),
        os.path.join("public", "uploads"),
    ]
    
    upload_dir = "uploads"
    found_frontend = False
    
    for p in paths_to_try:
        abs_p = os.path.abspath(p)
        parent_dir = os.path.dirname(abs_p)
        if os.path.exists(parent_dir):
            upload_dir = abs_p
            found_frontend = True
            break
            
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    if found_frontend:
        # Next.js can serve it relative to the public directory
        return {"url": f"/uploads/{file.filename}"}
        
    return {"url": f"http://localhost:8000/static/{file.filename}"}

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

