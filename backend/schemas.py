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

class AddToCart(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class UpdateCartItem(BaseModel):
    cart_item_id: int
    quantity: int