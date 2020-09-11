# Battle.net-Firebase-OAuth-handler
A Battle.net OAuth redirect handler in Firebase Functions 

This is a set of Firebase Functions that can be used by a client app that does not have support to handle a URL redirect to itself from the OAuth service provider, to get an OAuth authorization code from Battle.net or other OAuth service providers. (Only tested with Battle.net at this time.) It requires a Cloud Firestore instance set up in your Firebase account. (It will clean up data once the end user gets the OAuth Authorization code.)

## Firebase Setup

You can use the project folder as is to deploy as is, or just copy the code in [`functions/index.js`](functions/index.js) into your `index.js`.

You need to update the `secret` value to something known only to your client app.

## Client Use

There are 3 endpoints available in the set of Firebase Functions:
- `POST /oauth_session`
- `GET /oauth_redirect`
- `POST /oauth_code`

Here is how to use them with respect to OAuth.
1) Client must make a call to `POST /oauth_session` with the app secret in the JSON request payload like `{ "secret" : "12345" }`. This will return a JSON with a session key (ex: `{ "session" : "abcdef1234567890" }`).
2) Client/OAuth service provider must coordinate to use a redirect URL like `https://your-firebase-instance.com/oauth_redirect/{session}`. Where in this example, `{session}` is the session value in step (1) response. (Note: Battle.net adds `code` as a query parameter with the authorization code, so hopefully other OAuth service providers do this too, and this should work.)
3) Client can poll or wait for user to return from OAuth service provider's sign-in flow, and then call `POST /oauth_code`. Similar to step (1), the endpoint needs the JSON request payload with app secret, and also session, like `{ "secret" : "12345", "session" : "abcdef1234567890" }`. This will return a JSON with the OAuth authorization code (ex: `{ "code" : "1q2w3e4r5t6y7u8i9o" }`).

Congratulations! Now you have OAuth authorization code!
