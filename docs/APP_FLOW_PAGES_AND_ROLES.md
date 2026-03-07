# InkKeeper — App Flow, Pages, and Roles

## Site Map

/login  
/dashboard  
/sessions/timer  
/sessions/reflection  
/archive  

---

## Page Purposes

/login  
Authenticate via Magic Link.

/dashboard  
Practice overview + entry point.

/sessions/timer  
Focused reading container.

/sessions/reflection  
Record book + optional reflection.

/archive  
Ledger of sessions.

---

## User Role

Authenticated User

Permissions:
- Start session
- Pause
- End
- Save
- View archive
- Logout

No admin.
No editing.
No social features.

---

## Primary Journeys

Start Session:
Dashboard → Timer

Complete Session:
Timer → Reflection → Dashboard

End Early:
Timer → Dashboard

Review Archive:
Dashboard → Archive

---

## Flow Protection

No:
- Editing sessions
- Starting from archive
- Viewing totals during session
- Interruptive modals

v0.1 Sacred loop:

Dashboard → Timer → Reflection → Return