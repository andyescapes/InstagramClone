Vanilla JS: LinkedPic

### LinkedPic Features

#### 2.1.1. Login
 * When the user isn't logged in, the site shall present a login form that contains:
   * a username field (text)
   * a password field (password)
   * a password confirm field (password)
   * submit button to login
 * When the submit button is pressed, if the two passwords don't match the user should receive an error popup. If they do match, the form data should be sent to `POST /auth/login` to verify the credentials. If there is an error during login an appropriate error should appear on the screen.
 * Once the user is logged in, they should be able to see the feed which says "Not yet implemented"

#### 2.1.2. Registration
 * When the user isn't logged in, the login form shall provide a link/button that opens the register form. The register form will contain: 
   * a username field (text)
   * a password field (password)
   * a confirm password field (password) - not passed to backend, but error thrown on submit if doesn't match other password
   * an email address (text)
   * a name (text)
   * submit button to register
 * When the submit button is pressed, the form data should be sent to `POST /auth/signup` to verify the credentials. If there is an error during login an appropriate error should appear on the screen.
 * Once the user is logged in, they should be able to see the feed which says "Not yet implemented"

#### 2.1.3. Error Popup
 * Whenever the frontend or backend produces an error, there shall be an error popup on the screen with a message (either a message derived from the backend error rresponse, or one meaningfully created on the frontend).
 * This popup can be closed/removed/deleted by pressing an "x" or "close" button.

#### 2.2.1. Basic Feed

The application should present a "feed" of user content on the home page derived `GET /user/feed`.

The posts should be displayed in reverse chronological order (most recent posts first). 

Each post should display:
1. Who the post was made by
2. When it was posted
3. The image itself
4. How many likes it has (or none)
5. The post description text
6. How many comments the post has

Although this is not a graphic design exercise you should produce pages with a common and somewhat distinctive look-and-feel. You may find CSS useful for this.

### 2.3.1. Show Likes
* Allow a user to see a list of all users who have liked a post. You can just display all of them at once by default, or you can optionally (not required) toggle whether it's visible or not with a simple button.

### 2.3.2. Show Comments
* Allow a user to see all the comments on a post. You can just display all of them at once by default, or you can optionally (not required) toggle whether it's visible or not with a simple button.

### 2.3.3. Ability for you to like content
* A logged in user can like a post on their feed and trigger a api request (`PUT /post/like`)
* For now it's ok if the like doesn't show up until the page is refreshed.

### 2.3.4. Feed Pagination
* Users can page between sets of results in the feed using the position token with (`GET user/feed`).
* Note users can ignore this if they properly implement Infinite Scroll in a later milestone.

## 2.4. Milestone 4 - Other users & profiles (10%)

### 2.4.1. Profile View / Profile View
* Let a user click on a user's name from a post and see a page with the users name, and any other info the backend provides.
* The user should also see on this page all posts made by that person.
* The user should be able to see their own page as well.

### 2.4.2. Follow
* Let a user follow/unfollow another user too add/remove their posts to their feed via (`PUT user/follow`)
* Add a list of everyone a user follows in their profile page.
* Add just the count of followers / follows to everyones public user page

## 2.5. Milestone 5 - Adding & updating content (10%)

Milestone 5 focuses on more advanced features that will take time to implement and will involve a more rigourously designed app to execute.

### 2.5.1. Adding a post
* Users can upload and post new content from a modal or seperate page via (`POST /post`)

### 2.5.2. Updating & deleting  a post
* Let a user update a post they made or delete it via (`DELETE /post`) or (`PUT /post`). You are not required to allow the user to be able to update the image of a post.

### 2.5.3. Leaving comments
* Users can write comments on "posts" via (`POST post/comment`)

### 2.5.4. Updating the profile
* Users can update their personal profile via (`PUT /user`) E.g:
  * Update email address
  * Update password
  * Update name

### 2.6.1. Infinite Scroll
* Instead of pagination, users an infinitely scroll through results. For infinite scroll to be properly implemented you need to progressively load posts as you scroll. 

### 2.6.1. Live Update
* If a user likes a post or comments on a post, the posts likes and comments should update without requiring a page reload/refresh.

### 2.6.1. Push Notifications
* Users can receive push notifications when a user they follow posts an image. To know whether someone or not has made a post, you must "poll" the server (i.e. intermittent requests, maybe every second, that check the state). 

*Polling is very inefficient for browsers, but can often be used as it simplifies the technical needs on the server.*

