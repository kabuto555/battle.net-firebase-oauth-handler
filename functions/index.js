const secret = "make this secret match on your client";

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

// POST /oauth_session payload: { secret: パスワード }
// response: { session: セション }
exports.oauth_session = functions.https.onRequest(async (req, res) => {
    if (req.body.secret != secret) {
        res.status(401);
        res.json({error: "Invalid app secret."});
        return
    }

    const writeResult = await admin.firestore()
        .collection('session_codes')
        .add({last_updated: new Date().getTime()});

    res.json({session: writeResult.id});
});

// GET /oauth_redirect/{session}?code={12345}
exports.oauth_redirect = functions.https.onRequest(async (req, res) => {
    const now = new Date()
    const code = req.query.code;
    const sessionKey = req.path.replace(/^\/|\/$/g, '');
    
    console.log(`Got code: ${code} for session: ${sessionKey} at: ${now.getTime()}`);
    
    const docRef = admin.firestore()
        .collection('session_codes')
        .doc(sessionKey);
    await docRef.get().then(function(doc) {
        if (doc.exists) {
            docRef.set({ authorization_code: code, last_updated: now.getTime() });
            res.send("Authorization complete, please return to app!");
        } else {
            res.status(412);
            res.send("Error, redirect did not have a valid session.");
        }
    }).catch(function(error) {
        res.status(500);
        res.send(`Error handling OAuth redirect: ${error}`);
    });
});

// GET /oauth_code payload: { secret: パスワード, session: セション }
// response: { code: コード }
exports.oauth_code = functions.https.onRequest(async (req, res) => {
    if (req.body.secret != secret) {
        res.status(401);
        res.json({error: "Invalid app secret."});
        return
    }

    const sessionKey = req.body.session;
    const docRef = admin.firestore()
        .collection('session_codes')
        .doc(sessionKey);
    await docRef.get().then(function(doc) {
        if (doc.exists) {
            res.json({ code: doc.data().authorization_code });
            docRef.delete();
        } else {
            res.status(412);
            res.json({error:"Error redirect was never received for session."});
        }
    }).catch(function(error) {
        res.status(500);
        res.send(`Error getting OAuth code: ${error}`);
    });


});
