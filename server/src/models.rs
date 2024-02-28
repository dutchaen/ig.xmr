use chrono::serde::ts_milliseconds;
use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::{kit, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct ILogin {
    pub identifier: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IAjaxSignup {
    pub full_name: String,
    pub username: String,
    pub password: String,
    pub email: String,
    pub gender: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IComment {
    pub comment: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IMedia {
    pub media_base64: String,
    pub caption: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IProfilePhoto {
    pub photo: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ITextMessage {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IEditProfile {
    pub full_name: String,
    pub username: String,
    pub email: String,
    pub bio: String,
    pub website: Option<String>,
    pub gender: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ISetUsername {
    pub username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IChangePassword {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ICreateThread {
    pub with: u64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct UserModel {
    pub id: u64,
    pub username: String,
    pub hashed_password: String,
    pub salt: String,
    pub email: String,
    pub name: String,
    pub profile_photo: String,
    pub bio: String,
    pub website: Option<String>,
    pub is_verified: bool,
    pub gender: u8,
}

impl UserModel {
    pub fn to_base_user(&self) -> BaseUser {
        return BaseUser { id: self.id };
    }

    pub async fn to_viewable_user(
        &self,
        is_following: Option<bool>,
        manager: &Manager,
    ) -> Result<ViewableUser, Box<dyn std::error::Error>> {
        let (followers, following) =
            kit::get_follower_and_following_count(self.id, &manager).await?;

        return Ok(ViewableUser {
            id: self.id,
            username: self.username.to_owned(),
            name: self.name.to_owned(),
            bio: self.bio.to_owned(),
            is_verified: self.is_verified,
            follower_count: followers,
            following_count: following,
            is_following,
        });
    }

    pub fn to_private_user(&self) -> PrivateUser {
        return PrivateUser {
            id: self.id,
            username: self.username.to_owned(),
            email: self.email.to_owned(),
            name: self.name.to_owned(),
            bio: self.bio.to_owned(),
            website: self.website.to_owned(),
            is_verified: self.is_verified,
            gender: self.gender,
        };
    }

    pub async fn from_id(
        id: u64,
        manager: &Manager,
    ) -> Result<Option<UserModel>, Box<dyn std::error::Error>> {
        let user_model: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
            .bind(&id)
            .fetch_optional(&manager.pool)
            .await?;

        return Ok(user_model);
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct BaseUser {
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct PrivateUser {
    pub id: u64,
    pub username: String,
    pub email: String,
    pub name: String,
    pub bio: String,
    pub website: Option<String>,
    pub is_verified: bool,
    pub gender: u8,
}

impl BaseUser {
    pub async fn to_user_model(
        &self,
        manager: &Manager,
    ) -> Result<Option<UserModel>, Box<dyn std::error::Error>> {
        let user_model: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
            .bind(&self.id)
            .fetch_optional(&manager.pool)
            .await?;

        return Ok(user_model);
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ViewableUser {
    pub id: u64,
    pub username: String,
    pub name: String,
    pub bio: String,
    pub is_verified: bool,
    pub following_count: u64,
    pub follower_count: u64,
    pub is_following: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct PostInfo {
    pub id: u64,
    pub short_code: String,
    pub media_source: String,
    pub posted_by: u64,
    pub caption: String,
    pub created_at: chrono::DateTime<Utc>,
}

impl PostInfo {
    pub async fn to_base_post_info(
        &self,
        base_user: &Option<BaseUser>,
        manager: &Manager,
    ) -> Result<BasePostInfo, Box<dyn std::error::Error>> {
        let mut is_liked_by_me: Option<bool> = None;

        let (likes, comment_count) =
            kit::get_post_likes_and_comment_count(self.id, &manager).await?;
        if let Some(base_user) = base_user {
            is_liked_by_me = Some(kit::is_post_liked_by_me(self.id, base_user.id, &manager).await?);
        }

        let um = UserModel::from_id(self.posted_by, &manager).await?.unwrap();

        let viewable_user = um.to_viewable_user(None, &manager).await?;

        return Ok(BasePostInfo {
            id: self.id,
            short_code: self.short_code.to_owned(),
            posted_by: self.posted_by,
            owner: viewable_user,
            caption: self.caption.to_owned(),
            like_count: likes,
            comment_count,
            is_liked_by_me,
        });
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BasePostInfo {
    pub id: u64,
    pub short_code: String,
    pub posted_by: u64,
    pub owner: ViewableUser,
    pub caption: String,
    pub like_count: u64,
    pub comment_count: u64,
    pub is_liked_by_me: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct CommentModel {
    pub id: u64,
    pub owner_id: u64,
    pub content: String,

    #[serde(with = "ts_milliseconds")]
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ViewableComment {
    pub id: u64,
    pub owner: ViewableUser,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct PrivateIDModel {
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Inbox {
    pub threads: Vec<PreviewThread>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PreviewUser {
    pub username: String,
    pub id: u64,
    pub is_verified: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PreviewThread {
    pub id: u64,
    pub preview_message: String,
    pub is_preview_mine: bool,
    pub preview_sender: Option<PreviewUser>,
    pub reciptent: Option<PreviewUser>,
}

impl PreviewThread {
    pub async fn from_id(
        id: u64,
        manager: &Manager,
    ) -> Result<Option<PreviewUser>, Box<dyn std::error::Error>> {
        let user_model: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
            .bind(&id)
            .fetch_optional(&manager.pool)
            .await?;

        Ok(match user_model {
            Some(user) => Some(PreviewUser {
                username: user.username.to_owned(),
                id: user.id,
                is_verified: user.is_verified,
            }),
            None => None,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct PrivateMessage {
    pub id: u64,
    pub text: String,
    pub owner_id: u64,
    pub is_heart: bool,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectMessage {
    pub id: u64,
    pub text: String,
    pub is_heart: bool,
    pub owner_id: u64,
    pub created_at: chrono::DateTime<Utc>,

    pub is_mine: bool,
    pub likers: Vec<u64>,
    pub is_seen: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DatabaseThread {
    pub id: u64,
    pub created_at: chrono::DateTime<Utc>,
}
