![Node.js CI](https://github.com/waterfausett/respondo/workflows/Node.js%20CI/badge.svg)

# respondo
A Discord bot that responds to things :zany_face:

**respondo** works by utilizing `triggers` and `responses`.

A `trigger` is a word, or phrase, that you'd like to _trigger_ a response from **respondo**.

A `response` is what **respondo** will respond with when it sees a `trigger` word.
- these can be anything! (word, phrase, hyperlink, etc.)

A `trigger` can be configured to have any number of `responses` associated with it.
- when more than one `response` is available for a `trigger` **respondo** will randomly pick one :grin:

## How to use
Once added to a server, just mention **respondo** in to configure it.

add a `trigger`/`response` combo:
```
@repondo add [trigger] | [response]
```

remove a `trigger`/`response` combo:
```
@repondo remove [trigger] | [response]
```

remove a `trigger` altogether (and all of it's configured responses):
```
@repondo remove [trigger]
```

You can always ask for "help" ("?" works too), for detailed guidance.
```
@respondo help
```
---

Add to discord link:
https://discord.com/oauth2/authorize?client_id=CLIENTID&scope=bot
