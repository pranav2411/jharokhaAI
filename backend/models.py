from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, JSON

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: Optional[str] = Field(default=None)
    role: str = Field(default="customer")  # customer, artisan, admin
    phone: Optional[str] = None
    shipping_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    artisan_profile: Optional["Artisan"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    orders: List["Order"] = Relationship(back_populates="user")
    cart_items: List["CartItem"] = Relationship(back_populates="user")

class Artisan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    bio: str
    craft_type: str
    city: str
    rating: float = Field(default=5.0)
    photo_url: Optional[str] = None

    # Relationships
    user: User = Relationship(back_populates="artisan_profile")
    products: List["Product"] = Relationship(back_populates="artisan")

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(unique=True, index=True)
    jharokha_style: str  # arched-jharokha, round-jharokha, default-jharokha

    # Relationships
    products: List["Product"] = Relationship(back_populates="category")

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    artisan_id: int = Field(foreign_key="artisan.id")
    category_id: int = Field(foreign_key="category.id")
    title: str
    description: str
    base_price: float
    is_customizable: bool = Field(default=False)
    is_featured: bool = Field(default=False)
    stock_qty: int = Field(default=10)
    images: List[str] = Field(default=[], sa_column=Column(JSON))
    status: str = Field(default="active")  # active, draft, sold_out

    # Relationships
    artisan: Artisan = Relationship(back_populates="products")
    category: Category = Relationship(back_populates="products")
    customization_options: List["CustomizationOption"] = Relationship(back_populates="product", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    reviews: List["Review"] = Relationship(back_populates="product", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class CustomizationOption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    option_name: str  # e.g., "Color", "Size", "Engraving Text"
    option_type: str  # select, text, color_swatch, number
    choices: List[Any] = Field(default=[], sa_column=Column(JSON))  # e.g., ["Red", "Blue"] or dict with limits
    price_delta: float = Field(default=0.0)  # Upcharge per choice (optional, or can be structured in choices)

    # Relationships
    product: Product = Relationship(back_populates="customization_options")

class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    product_id: int = Field(foreign_key="product.id")
    qty: int = Field(default=1)
    selected_customizations: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))

    # Relationships
    user: User = Relationship(back_populates="cart_items")
    product: Product = Relationship()

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    total: float
    status: str = Field(default="pending")  # pending, paid, shipped, delivered, cancelled
    shipping_address: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="orders")
    items: List["OrderItem"] = Relationship(back_populates="order", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    qty: int
    customizations: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    price_at_purchase: float

    # Relationships
    order: Order = Relationship(back_populates="items")
    product: Product = Relationship()

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    user_id: int = Field(foreign_key="user.id")
    rating: int = Field(default=5)
    comment: str
    images: List[str] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    product: Product = Relationship(back_populates="reviews")
    user: User = Relationship()

class CallbackRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user_name: str
    phone: str
    status: str = Field(default="pending")  # pending, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
