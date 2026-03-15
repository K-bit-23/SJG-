# Contact Messages in MongoDB

I have updated the application to save Contact Form messages directly to MongoDB.

## Changes Made:

### Backend
1.  **New Serializer**: `ContactMessageSerializer` in `backend/api/serializers.py` to validate name, email, and message.
2.  **New View**: `ContactMessageView` in `backend/api/views.py` to handle POST requests and insert into the `messages` collection.
3.  **New Route**: `/api/contact/` endpoint added to `backend/api/urls.py`.
4.  **Dashboard Update**: `DashboardStatsView` now includes a count of `total_messages` so you can monitor submissions.

### Frontend
1.  **Config**: Added `CONTACT` endpoint to `src/config.js`.
2.  **Contact Page**: Updated `src/pages/Contact.js` to:
    *   Send a POST request to the backend `CONTACT` endpoint.
    *   Show a loading state ("Sending...").
    *   Handle success and error responses.

## Verification
To verify, you can fill out the form on the Contact page. The data will be saved to your MongoDB `messages` collection.
Admin users will see the total message count on the Dashboard.
