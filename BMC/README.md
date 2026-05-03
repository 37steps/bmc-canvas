# BMC Canvas — לוח עסקי שיתופי

אפליקציית Business Model Canvas שיתופית בזמן אמת, מבוססת Firebase.

## תכונות
- יצירת חדר שיתוף עם קישור ייחודי
- שיתוף פעולה בזמן אמת (Realtime Database)
- פתקים עם צבעים, מדדי הצלחה, וניתוח SWOT
- ייצוא CSV

---

## Firebase — הגדרת Security Rules

### רקע
האפליקציה משתמשת ב-**Firebase Anonymous Authentication**: כל מבקר מקבל אוטומטית UID אנונימי — ללא הרשמה, ללא סיסמה. כך ניתן להגדיר חוקי אבטחה שדורשים `auth != null` מבלי לחסום משתמשים.

### חוקים מומלצים

הדבק את הכלל הבא בעמוד **Realtime Database → Rules** ב-Firebase Console:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

**מה זה אומר:**
- גישה מותרת רק למשתמשים שעברו Anonymous Auth (נעשה אוטומטית בטעינת האפליקציה)
- גישה חסומה לכלים חיצוניים ו-bots שאין להם auth token
- מבנה הנתונים מוגבל ל-`/rooms/...` בלבד

### איך להחיל
1. פתח את [Firebase Console](https://console.firebase.google.com)
2. בחר את הפרויקט
3. לך ל-**Realtime Database → Rules**
4. החלף את התוכן בחוק למעלה
5. לחץ **Publish**

### הפעלת Anonymous Authentication
1. ב-Firebase Console → **Authentication → Sign-in method**
2. בחר **Anonymous** ולחץ **Enable**

---

## מבנה הנתונים ב-Firebase

```
rooms/
  {roomId}/
    notes/
      {noteId}: { id, bk, text, color, author, ts, metric, swot, swotAnswer }
    presence/
      {authUid}: true
    wind: timestamp (ארעי)
```

---

## הרצה מקומית

פתח את `bmc.html` ישירות בדפדפן, או הרץ שרת מקומי:

```bash
python3 -m http.server 8080
```

ופתח `http://localhost:8080/bmc.html`
