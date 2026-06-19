from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CategoryCreate(BaseModel):
    name: str


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: int
    image_url: str
    rating: float = 4.5
    reviews: int = 100
    original_price: float = None
    discount_percent: int = None
    is_best_seller: bool = False

class AddToCart(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class UpdateCartItem(BaseModel):
    cart_item_id: int
    quantity: int

class LoginRequest(BaseModel):
    email: str
    password: str


class OrderCreate(BaseModel):
    user_id: int
    delivery_address: str = None
    payment_method: str = "COD"


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    user_id: int
    product_id: int
    rating: int
    title: str
    body: str


class AddressCreate(BaseModel):
    user_id: int
    full_name: str
    phone: str
    line1: str
    line2: str = None
    city: str
    state: str
    pincode: str


class WishlistCreate(BaseModel):
    user_id: int
    product_id: int


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int

    class Config:
        from_attributes = True


