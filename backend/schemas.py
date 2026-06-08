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

class CreateOrder(BaseModel):
    user_id: int

class LoginRequest(BaseModel):
    email: str
    password: str


class OrderCreate(BaseModel):
    user_id: int


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str

    class Config:
        from_attributes = True


