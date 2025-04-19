import strawberry
from django.contrib.auth import get_user_model
from chowkidar.authentication import authenticate
from chowkidar.extension import JWTAuthExtension
from chowkidar.decorators import login_required
from chowkidar.wrappers import issue_tokens_on_login, revoke_tokens_on_logout
from chowkidar.utils.jwt import generate_token_from_claims # ✅ Import JWT utilities
from api.models import Profile 

from datetime import timedelta

User = get_user_model()

@strawberry.type
class UserType:
    id: strawberry.ID
    username: str
    email: str

@strawberry.type
class AuthPayload:
    user: UserType
    access_token: str
    refresh_token: str

@strawberry.type
class AuthMutation:
    @strawberry.mutation
    def login(self, info, username: str, password: str) -> AuthPayload:
        """Authenticate user and return access & refresh tokens"""
        user = authenticate(username=username.lower(), password=password)
        if user is None:
            raise Exception("Invalid username or password")

        access_token_data = generate_token_from_claims(
            {"sub": user.id, "username": user.username},
            expiration_delta=timedelta(minutes=15)
        )
        refresh_token_data = generate_token_from_claims(
            {"sub": user.id, "type": "refresh"},
            expiration_delta=timedelta(days=7)
        )

        # Extract only the token string
        access_token = access_token_data["token"]
        refresh_token = refresh_token_data["token"]
        return AuthPayload(
            user=UserType(id=user.id, username=user.username, email=user.email),
            access_token=access_token,
            refresh_token=refresh_token
        )

    @strawberry.mutation
    @revoke_tokens_on_logout
    def logout(self, info) -> bool:
        """Revoke tokens on logout"""
        info.context.LOGOUT_USER = True
        return True

    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> UserType:
        """Register a new user"""
        if User.objects.filter(username=username).exists():
            raise Exception("Username already exists")
        if User.objects.filter(email=email).exists():
            raise Exception("Email already exists")

        user = User.objects.create_user(username=username.lower(), email=email, password=password)
        Profile.objects.create(user=user,username=username.lower(),email=email)

        return UserType(id=user.id, username=user.username, email=user.email)

@strawberry.type
class AuthQuery:
    @strawberry.field
    @login_required
    def me(self, info) -> UserType:
        """Get details of the currently authenticated user"""
        user = info.context.user
        return UserType(id=user.id, username=user.username, email=user.email)

schema = strawberry.Schema(
    query=AuthQuery,
    mutation=AuthMutation,
    types=[UserType, AuthPayload],
    extensions=[JWTAuthExtension],
)