# CUB: Canine Understanding Buddy

Prototype website for matching humans and dogs using:

- A public consumer home page and match quiz
- A private partner intake page for shelters/pet shops
- C-BARQ item-level intake with 101 questions
- SQLite dog storage
- MBTI-style, lifestyle, housing, experience, and preference-based matching

## Run Locally

From this folder:

```bash
python3 server.py --host 127.0.0.1 --port 4173
```

Open:

```text
http://127.0.0.1:4173/
```

## Share On Same Wi-Fi

```bash
python3 server.py --host 0.0.0.0 --port 4173
```

Then friends on the same Wi-Fi can open your computer's local network URL, for example:

```text
http://172.20.10.2:4173/
```

## Pages

- `/` public home page
- `/match` public match quiz
- `/partner` locked partner intake page

Prototype partner access code:

```text
CUBSHOP
```

## Production Domain Target

```text
https://cub-buddy.com/
```
