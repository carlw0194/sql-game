1. Main Menu (Welcome Screen)
+----------------------------------------------------------+
|                      SQL SCENARIO                       |
|----------------------------------------------------------|
|                                                          |
|   [ Avatar ]     WELCOME, <PlayerName>!                  |
|                                                          |
|                                                          |
|   1) CAREER MODE (Story Campaign)                        |
|   2) SANDBOX MODE (Practice / Free Play)                 |
|   3) MULTIPLAYER (SQL Duels / Team Challenges)           |
|   4) LEADERBOARD (Global & Friends)                      |
|   5) PROFILE (Avatar, Stats, Achievements)               |
|                                                          |
|       [ LOGOUT ]               [ SETTINGS ]              |
+----------------------------------------------------------+
Notes:

Top banner with the game title.
Player’s avatar and name displayed.
Main navigation buttons.
Additional buttons: Settings, Logout.

2. Career Mode – Level Select
+----------------------------------------------------------+
|                CAREER MODE – SELECT LEVEL               |
|----------------------------------------------------------|
|  PROGRESS: [■■■■■■■■■---------]  30%                    |
|                                                          |
|  Level Cluster:                                          |
|  (O) 1–10: Foundation Queries                            |
|  (O) 11–20: Joins & Subqueries                           |
|  (O) 21–30: Indexing Basics                              |
|  (*) 31–40: Intermediate Queries                         |
|  ( ) 41–50: Performance Tuning                           |
|  ( ) 51–60: Advanced Tuning & Partitioning               |
|  ... (and so on up to 500+)                              |
|                                                          |
|  [ SELECTED LEVELS: 31–40 ]                              |
|  LEVEL 31  LEVEL 32  LEVEL 33  LEVEL 34  LEVEL 35        |
|  LEVEL 36  LEVEL 37  LEVEL 38  LEVEL 39  LEVEL 40        |
|                                                          |
|  <Back to Main>                 <Enter Challenge>         |
+----------------------------------------------------------+
Notes:

Progress bar shows how far the player has come.
Level clusters grouped by topic.
Each cluster expands to show specific levels.
3. Challenge Screen (Scenario & Query Editor)
+----------------------------------------------------------+
| SCENARIO TITLE: "Optimize Customer Orders Query"         |
| Scenario: "A slow query is causing major latency in ...  |
|  your e-commerce system. Fix it by adding indexes,       |
|  refactoring joins, etc."                                |
|----------------------------------------------------------|
|  [ Database Schema / Hints ]  |  [ SQL Editor ]          |
|  -----------------------------+-------------------------- |
|  Tables:                      | SELECT * FROM Orders      |
|   - Orders                    | JOIN Customers ...        |
|   - Customers                 | // Type query here...     |
|   - ...                       |                          |
|                              | [ Run Query ] [ Submit ]  |
|  Hints used: 0/3             |                          |
|  Time left: 05:48            |  Output / Results:        |
|                              |  - Execution time: 3.2s    |
|                              |  - Index needed? Yes       |
|----------------------------------------------------------|
|  <Back to Levels>                                  Score: 80|
+----------------------------------------------------------+
Notes:

Left pane: scenario details, table schemas, optional hints.
Right pane: a SQL editor with real-time feedback and execution results.
Run Query to test partial solutions, Submit for final evaluation.
A score or progress bar is shown at the bottom or top right.

4. Sandbox Mode
+----------------------------------------------------------+
|                  SANDBOX – PLAYGROUND                   |
|----------------------------------------------------------|
|  LOAD DATASET: [ Drop-down of available sample DBs ]     |
|----------------------------------------------------------|
| [ SQL Editor ]                                           |
|  ------------------------------------------------------- |
|  // Write or paste your queries here...                  |
|                                                          |
|  [ Execute ]  [ Clear ]                                  |
|                                                          |
|  Query Results / Execution Plan:                         |
|  - Plan: Seq Scan on table?                              |
|  - Time: 450 ms                                          |
|  - Row Count: 10,000                                     |
|                                                          |
|----------------------------------------------------------|
|   <Back to Main>                         [ Save Query ]  |
+----------------------------------------------------------+
Notes:

Simple, open-ended SQL editor.
Ability to load different sample databases or user-uploaded data.
Live execution plan to practice performance tuning.

5. Profile & Progress Screen
+----------------------------------------------------------+
|                    PROFILE & PROGRESS                   |
|----------------------------------------------------------|
|   Avatar: (DBA WIZARD)         Player:  <PlayerName>     |
|----------------------------------------------------------|
|  Level: 15 (Junior DBA)   XP: 2500 / 5000                |
|  Badges: [Indexing Pro] [Query Tuner]                    |
|                                                          |
|  Achievements:                                           |
|   - Solved 50 Queries in <30s each                       |
|   - Master of Joins (Completed Level 20)                 |
|   - ...                                                  |
|                                                          |
|  Skill Tree / Stats:                                     |
|   ----------------------------------------------------    |
|   Query Mastery:   [■■■■----]                             |
|   Indexing Skills: [■■■-----]                             |
|   Security:        [■-------]                             |
|   ...                                                   |
|                                                          |
| [ Edit Avatar ]   [ View Trophies ]   [ Share Progress ] |
|   <Back to Main>                                         |
+----------------------------------------------------------+
Notes:

Highlights XP bar, current level, badges, and skill distribution.
Option to customize avatar.
Achievements or trophies visible.
6. Leaderboard Screen
+----------------------------------------------------------+
|                     GLOBAL LEADERBOARD                  |
|----------------------------------------------------------|
|   Rank | Player Name   | Level   | XP     | Badges       |
|----------------------------------------------------------|
|   1    | SuperDBA      | 50      | 50,000 | [Index-Pro]  |
|   2    | QueryMaster42 | 48      | 47,300 | [Tuner]      |
|   3    | DataHero      | 47      | 46,500 | [Sec-Guru]   |
|  ...   | ...           | ...     | ...    | ...          |
|----------------------------------------------------------|
|  [ Toggle: Global / Friends / Local Region ]             |
|  <Back to Main>                                          |
+----------------------------------------------------------+
Notes:

Top players by XP or score.
Badges displayed next to player names.
Option to filter by region or friends.