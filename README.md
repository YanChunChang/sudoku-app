# SudokuApp
Eine voll funktionsfähige Sudoku-Webanwendung mit Login, Timer, Leaderboard und mehreren modernen Features.  
Das Projekt entstand aus der Idee, ein Spiel für einen Freund nachzubauen – und um zu lernen, wie man ein Webprojekt von Grund auf konzipiert, designt und umsetzt.

## Motivation
Ich wollte ein Spiel entwickeln – etwas, das ich selbst noch nie gemacht hatte. 
Inspiriert durch meinen Freund, der gerne Sudoku spielt, habe ich im Mai 2025 begonnen, diese App zu bauen. 
Ziel war es, zu lernen, wie ein komplettes Webprojekt entsteht: von der Frontend-Architektur über Backend-Logik bis zur Kommunikation zwischen beiden Teilen.

## Tech-Stack
- **Frontend:** Angular 19, SCSS, RxJS (BehaviorSubject, Subject), i18n (Translation Service)
- **Backend:** Node.js (Express), MongoDB, JWT Auth
- **Deployment:** Frontend auf Nestify · Backend auf Render.com
- **Tools:** Angular CLI, Postman, Git
- **Sonstiges:** Docker, MVC-Struktur, Miro

## Features
- Benutzerregistrierung & Login mit E-Mail-Bestätigung (Nodemailer)
- Sudoku-Spielbrett mit Timer
- Der aktuelle Spielstand wird lokal gespeichert (auch nach Seiten-Reload)
- Dark- / Light-Mode Toggle
- Mehrsprachigkeit durch Angular Translation Service
- Leaderboard mit gespeicherten Zeiten (MongoDB)
- Responsive Design (für Desktop & Mobile)

## Live-Demo & API
👉 [Live-Demo auf Nestify](https://sudoku-chun.netlify.app/sudoku)
**Hinweis:** Das Backend läuft auf Render.com (Free Tier). Beim ersten Laden (z. B. Leaderboard) kann es daher zu kurzer Wartezeit kommen.


## Was ich gelernt habe
- Wie Frontend & Backend miteinander kommunizieren (REST, Services)
- Strukturierung eines Projekts mit **Service/Model/Controller**
- Verwendung von **RxJS** (Subject, BehaviorSubject) für komponentenübergreifende Kommunikation
- Aufbau einer Authentifizierung mit JWT, Nodemailer & MongoDB 
- Umgang mit Übersetzungen und Themes in Angular
- Projektorganisation und Featureplanung

## Nächste Schritte / Todo
- Echtzeit-Multiplayer (Koop-Modus)