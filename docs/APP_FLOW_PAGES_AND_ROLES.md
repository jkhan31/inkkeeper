# InkKeeper — App Flow, Pages, and Roles

## Site Map

/login  
/dashboard  
/session/setup  
/session/timer  
/session/reflection  
/history  

---

## Page Purposes

/login  
Authenticate via Magic Link.

/dashboard  
Practice overview + entry point.

/session/setup  
Select duration deliberately.

/session/timer  
Focused reading container.

/session/reflection  
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