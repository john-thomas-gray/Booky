1. **AttendeeResponse & AttendeeUpdate**

    - Used for managing attendee data for specified book meeting.

2. **Bet**

    - Represents a betting action in a book meeting.

3. **BookRequest & BookResponse**

    - Defines the data needed to create a book and the structure of book data returned from GoogleBooks API call (search by title on front-end).

4. **ClubRequest, ClubResponse, & ClubEditRequest**

    - Used for creating, responding, and editing club information.

5. **FriendRequest & FriendResponse**

    - Manage friend relationships (or lack thereof) and requests.
    - Tracks status of friendships or requests.

6. **UserNew, UserOut, UserRequest, UserResponse, & UserUpdate**

    - User-related operations including creation, updates, and general user information display.
    - Include username, password (in secure contexts), email, and other personal identifiers.

7. **MeetingRequest & MeetingResponse**

    - Meeting creation where a specific book, time, and club are chosen.

8. **HTTPValidationError & ValidationError**
    - Used for error handling, detailing the structure of validation errors returned by the API.
    - Help in debugging and error tracking by specifying the location and message of the error.

### Authentication Endpoints

**Methods: POST**

-   **Path**: `/api/auth/signup`
-   **Path**: `/api/auth/signin`

**Input** (Content-Type: `application/json`):

-   **Signup Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
-   **Signin Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```

**Output**:

-   **Signup Response** (200 OK):
    ```json
    {
        "id": "int",
        "username": "string",
        "email": "string"
    }
    ```
-   **Signin Response** (200 OK):
    ```json
    {
        "id": "int",
        "username": "string",
        "email": "string"
    }
    ```
-   **Error Response** (422 Validation Error for both):
    ```json
    {
        "detail": [
            {
                "loc": ["string"],
                "msg": "string",
                "type": "string"
            }
        ]
    }
    ```

**Methods: GET, DELETE**

-   **GET Path**: `/api/auth/authenticate`
-   **DELETE Path**: `/api/auth/signout`

**Authenticate (GET) Output** (200 OK):

```json
{
    "id": "int",
    "username": "string",
    "email": "string"
}
```

-   **Error** (404 Not Logged In)

**Signout (DELETE) Output** (200 OK):

-   **Description**: "User successfully signed out"

### Description

-   **Signup**: Creates a user account, validating data and creating a new user record.
-   **Signin**: Authenticates a user by checking credentials, returns details without password.
-   **Authenticate**: Returns user data if logged in, else error 404.
-   **Signout**: Successfully logs out the user.

### User Management Endpoints

**Methods: GET, POST, PATCH, DELETE**

-   **Path**: `/api/users/` (GET to list, POST to create)
-   **Path**: `/api/users/{id}` (GET details, PATCH to update, DELETE to remove)

**Input for User Creation (POST)**:

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```

**Output (Content-Type: `application/json`)**:

-   **GET List** & **GET Details**:
    ```json
    {
        "id": "int",
        "username": "string",
        "email": "string"
    }
    ```
-   **POST Create** & **PATCH Update**:
    ```json
    {
        "id": "int",
        "username": "string",
        "email": "string"
    }
    ```
-   **DELETE**:
    -   **Status Code**: 200
    -   **Description**: "User successfully deleted"

### Club and User Management Endpoints

**Methods: GET, POST, PATCH, DELETE**

-   **Path**: `/api/users/club/{club_id}` (GET to list club members, POST to join)
-   **Path**: `/api/clubs` (GET to list clubs, POST to create)
-   **Path**: `/api/clubs/{club_id}` (GET details, PATCH to update, DELETE to remove)
-   **Path**: `/api/clubs/user/{user_id}` (GET to list clubs by user)

**Club Management Input for Creation (POST)**:

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "name": "string",
        "description": "string",
        "location": "string"
    }
    ```

**Club Management Output (Content-Type: `application/json`)**:

-   **GET List Clubs** & **GET Details**:
    ```json
    {
        "club_id": "int",
        "name": "string",
        "description": "string",
        "location": "string"
    }
    ```
-   **POST Create** & **PATCH Update**:
    ```json
    {
        "club_id": "int",
        "name": "string",
        "description": "string",
        "location": "string"
    }
    ```
-   **DELETE Club**:
    -   **Status Code**: 200
    -   **Description**: "Club successfully deleted"

### List Club Members (GET)

-   **Content-Type**: None required for GET
-   **Path Parameters**:
    -   **club_id** (required): Integer ID of the club

### Output for List Club Members

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "username": "string",
                "email": "string"
            }
        ]
        ```

### Join Club (POST)

-   **Content-Type**: `application/json`
-   **Path Parameters**:
    -   **club_id** (required): Integer ID of the club
-   **Cookie Parameters**:
    -   **fast_api_token** (optional): Token used to authenticate the user session

### Output for Join Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "username": "string",
            "email": "string",
            "club_id": "int"
        }
        ```

### Create Club (POST)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "name": "string",
        "description": "string",
        "members": [
            {
                "user_id": "int",
                "role": "string"
            }
        ]
    }
    ```

### Output for Create Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "name": "string",
            "description": "string"
        }
        ```

### List Clubs (GET)

-   **Content-Type**: None required for GET

### Output for List Clubs

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "name": "string",
                "description": "string"
            }
        ]
        ```

### Get, Update, and Delete Club (GET, PATCH, DELETE)

-   **Content-Type for PATCH**: `application/json`
-   **Path Parameters**:
    -   **club_id** (required): Integer ID of the club

### Output for Get Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "name": "string",
            "description": "string"
        }
        ```

### Output for Update Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "name": "string",
            "description": "string"
        }
        ```

### Output for Delete Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### List Clubs By User (GET)

-   **Content-Type**: None required for GET
-   **Path Parameters**:
    -   **user_id** (required): Integer ID of the user

### Output for List Clubs By User

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "name": "string",
                "description": "string"
            }
        ]
        ```

### Meeting Endpoints

**Methods: POST, GET, DELETE**

**Paths:**

-   `/api/meeting/create` (POST to create a meeting)
-   `/api/meeting/` (GET to list all meetings)
-   `/api/meeting/club/{club_id}` (GET to list meetings by club)
-   `/api/meeting/{id}` (GET to get details, DELETE to remove a meeting)
-   `/api/meeting/{id}/users` (GET to list users by meeting)
-   `/api/meeting/{user_id}/user` (GET to list meetings by user)

### Create Meeting (POST)

-   **Content-Type**: `application/json`
-   **Cookie Parameters**:
    -   **fast_api_token** (optional): Token used for user session validation
-   **Body**:
    ```json
    {
        "title": "string",
        "date": "datetime",
        "location": "string",
        "club_id": "int"
    }
    ```

### Output for Create Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "title": "string",
            "date": "datetime",
            "location": "string",
            "club_id": "int"
        }
        ```

### List Meetings (GET)

-   **Content-Type**: None required for GET

### Output for List Meetings

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "title": "string",
                "date": "datetime",
                "location": "string",
                "club_id": "int"
            }
        ]
        ```

### List Meetings By Club (GET)

-   **Content-Type**: None required for GET
-   **Path Parameters**:
    -   **club_id** (required): Integer ID of the club

### Output for List Meetings By Club

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "title": "string",
                "date": "datetime",
                "location": "string",
                "club_id": "int"
            }
        ]
        ```

### Get Meeting Details, Delete Meeting (GET, DELETE)

-   **Path Parameters**:
    -   **id** (required): Integer ID of the meeting

### Output for Get Meeting Details

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "title": "string",
            "date": "datetime",
            "location": "string",
            "club_id": "int"
        }
        ```

### Output for Delete Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### List Users By Meeting (GET)

-   **Path Parameters**:
    -   **id** (required): Integer ID of the meeting

### Output for List Users By Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "user_id": "int",
                "username": "string"
            }
        ]
        ```

### List Meetings By User (GET)

-   **Path Parameters**:
    -   **user_id** (required): Integer ID of the user

### Output for List Meetings By User

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "title": "string",
                "date": "datetime",
                "location": "string"
            }
        ]
        ```

### Book Management Endpoints

**Methods: POST, GET, DELETE**

**Paths:**

-   `/book` (POST to create a book)
-   `/book/{book_id}` (DELETE to remove a book)
-   `/books/title/{title}` (GET to retrieve a book by title)
-   `/books` (GET to list all books)
-   `/getbooks/{title}` (GET to fetch a book by title, likely redundant with `/books/title/{title}`)

### Create Book (POST)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "title": "string",
        "author": "string",
        "isbn": "string",
        "publicationYear": "int"
    }
    ```

### Output for Create Book

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "title": "string",
            "author": "string",
            "isbn": "string",
            "publicationYear": "int"
        }
        ```

### Delete Book (DELETE)

-   **Path Parameters**:
    -   **book_id** (required): Integer ID of the book

### Output for Delete Book

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### Get Book by Title (/books/title/{title} and /getbooks/{title})

-   **Path Parameters**:
    -   **title** (required): String title of the book

### Output for Get Book by Title

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "id": "int",
            "title": "string",
            "author": "string",
            "isbn": "string",
            "publicationYear": "int"
        }
        ```

### List All Books (/books)

-   **Content-Type**: None required for GET

### Output for List All Books

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "id": "int",
                "title": "string",
                "author": "string",
                "isbn": "string",
                "publicationYear": "int"
            }
        ]
        ```

### Attendee Management Endpoints

**Methods: GET, POST, DELETE, PATCH**

**Paths:**

-   `/api/attendees/{meeting_id}/attendees` (GET to list attendees by meeting)
-   `/api/attendees/{meeting_id}` (POST to join a meeting)
-   `/api/attendees/{meeting_id}/leave` (DELETE to leave a meeting)
-   `/api/attendees/page` (PATCH to update an attendee)
-   `/api/attendees/finish/{meeting_id}/{attendee_id}` (PATCH to mark an attendee's participation as finished)
-   `/api/attendees/page/{meeting_id}/{attendee_id}` (GET to get an attendee's details)

### List Attendees By Meeting (GET)

-   **Content-Type**: None required for GET
-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting

### Output for List Attendees By Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "attendee_id": "int",
                "user_id": "int",
                "meeting_id": "int",
                "status": "string"
            }
        ]
        ```

### Join Meeting (POST)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting

### Output for Join Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "attendee_id": "int",
            "user_id": "int",
            "meeting_id": "int",
            "status": "joined"
        }
        ```

### Leave Meeting (DELETE)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting

### Output for Leave Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### Update Attendee (PATCH)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "status": "updated_status"
    }
    ```

### Output for Update Attendee

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "attendee_id": "int",
            "status": "updated_status"
        }
        ```

### Finish Attendee (PATCH)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting
    -   **attendee_id** (required): Integer ID of the attendee

### Output for Finish Attendee

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### Get Attendee Details (GET)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting
    -   **attendee_id** (required): Integer ID of the attendee

### Output for Get Attendee Details

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "attendee_id": "int",
            "user_id": "int",
            "meeting_id": "int",
            "status": "string"
        }
        ```

### Club User Management Endpoints (List Clubs by User ID and List All User Clubs)

**Methods: GET**

**Paths:**

-   `/api/users/clubs/{owner_id}` (GET to list clubs by owner ID)
-   `/api/users/clubs/` (GET to list all user clubs)

### List User Clubs By Owner ID (GET)

-   **Path Parameters**:
    -   **owner_id** (required): Integer ID of the club owner

### Betting Management Endpoints

**Methods: POST, GET, PATCH**

**Paths:**

-   `/api/bets/place` (POST to place a bet)
-   `/api/bets/` (GET to fetch a specific bet using query parameters)
-   `/api/bets/{meeting_id}` (GET to list bets by meeting)
-   `/api/bets/{meeting_id}/{better_id}` (PATCH to mark a bet as paid)

### Place Bet (POST)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "meeting_id": "int",
        "better_id": "int",
        "amount": "decimal",
        "prediction": "string"
    }
    ```

### Output for Place Bet

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "bet_id": "int",
            "meeting_id": "int",
            "better_id": "int",
            "amount": "decimal",
            "prediction": "string",
            "status": "placed"
        }
        ```

### Get Bet (GET)

-   **Query Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting
    -   **better_id** (required): Integer ID of the better

### Output for Get Bet

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "bet_id": "int",
            "meeting_id": "int",
            "better_id": "int",
            "amount": "decimal",
            "prediction": "string",
            "status": "active"
        }
        ```

### List Bets By Meeting (GET)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting

### Output for List Bets By Meeting

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "bet_id": "int",
                "better_id": "int",
                "amount": "decimal",
                "prediction": "string",
                "status": "active"
            }
        ]
        ```

### Bet Paid (PATCH)

-   **Path Parameters**:
    -   **meeting_id** (required): Integer ID of the meeting
    -   **better_id** (required): Integer ID of the better

### Output for Bet Paid

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### Friend Management Endpoints

**Methods: POST, GET, DELETE**

**Paths:**

-   `/api/friend` (POST to add a friend)
-   `/api/friends` (GET to list all friends)
-   `/api/{member_id}/friends` (GET to list friends by member ID)
-   `/api/friend/{member_id}/{friend_id}` (DELETE to remove a friend)
-   `/api/friend/request` (POST to send a friend request)
-   `/api/friend/request/{user_id}/{friend_id}` (DELETE to deny a friend request)
-   `/api/friend/requests` (GET to list all friend requests)
-   `/api/launch-details` (GET for miscellaneous details)

### Add Friend (POST)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "user_id": "int",
        "friend_id": "int"
    }
    ```

### Output for Add Friend

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "relationship_id": "int",
            "status": "added"
        }
        ```

### List All Friends (GET)

-   **Content-Type**: None required for GET

### Output for List All Friends

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "user_id": "int",
                "friend_id": "int",
                "status": "active"
            }
        ]
        ```

### List Friends By Member ID (GET)

-   **Path Parameters**:
    -   **member_id** (required): Integer ID of the member

### Output for List Friends By Member ID

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "user_id": "int",
                "friend_id": "int",
                "status": "active"
            }
        ]
        ```

### Remove Friend (DELETE)

-   **Path Parameters**:
    -   **member_id** (required): Integer ID of the member
    -   **friend_id** (required): Integer ID of the friend

### Output for Remove Friend

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### Send Friend Request (POST)

-   **Content-Type**: `application/json`
-   **Body**:
    ```json
    {
        "user_id": "int",
        "friend_id": "int"
    }
    ```

### Output for Send Friend Request

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "request_id": "int",
            "status": "pending"
        }
        ```

### Deny Friend Request (DELETE)

-   **Path Parameters**:
    -   **user_id** (required): Integer ID of the user
    -   **friend_id** (required): Integer ID of the friend

### Output for Deny Friend Request

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "success": true
        }
        ```

### List All Friend Requests (GET)

-   **Content-Type**: None required for GET

### Output for List All Friend Requests

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        [
            {
                "request_id": "int",
                "user_id": "int",
                "friend_id": "int",
                "status": "pending"
            }
        ]
        ```

### Miscellaneous Launch Details (GET)

-   **Content-Type**: None required for GET

### Output for Launch Details

-   **Status Code**: 200
    -   **Content-Type**: `application/json`
    -   **Body**:
        ```json
        {
            "details": "Various data points relevant to launch"
        }
        ```
