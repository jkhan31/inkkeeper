# InkKeeper — App Flow, Pages, and Roles

## Site Map

/login  
/dashboard  
/session/setup  
/session/active  
/session/log  
/history  

---

## Page Purposes

/login  
Authenticate via Magic Link.

/dashboard  
Practice overview + entry point.

/session/setup  
Select duration deliberately.

/session/active  
Focused reading container.

/session/log  
Record book + optional reflection.

/history  
Ledger of sessions.

---

## User Role

Authenticated User

Permissions:
- Start session
- Pause
- End
- Save
- View history
- Logout

No admin.
No editing.
No social features.

---

## Primary Journeys

Start Session:
Dashboard → Setup → Active

Complete Session:
Active → Log → Dashboard

End Early:
Active → Dashboard

Review History:
Dashboard → History

---

## Flow Protection

No:
- Editing sessions
- Starting from history
- Viewing totals during session
- Interruptive modals

Sacred loop:

Dashboard → Setup → Active → Log → Return