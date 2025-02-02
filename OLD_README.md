# osu-profile-stats

<br>
<div style="display: flex;">
    <a href="https://github.com/Luis-Tanese/osu-profile-stats/blob/main/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/Luis-Tanese/osu-profile-stats"></a>
    <a href="https://osu-profile-stats.vercel.app"><img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fosu-profile-stats.vercel.app"></a>
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Luis-Tanese/osu-profile-stats">
</div>
<br>
<div style="display: flex;">
    <img alt="Javascript Badge" src="https://img.shields.io/badge/-Javascript-F0DB4F?style=for-the-badge&labelColor=black&logo=javascript&logoColor=F0DB4F">
    <img alt="Nodejs Badge" src="https://img.shields.io/badge/-Nodejs-3C873A?style=for-the-badge&labelColor=black&logo=node.js&logoColor=3C873A">
</div>
<br>

osu-profile-stats generates SVG cards displaying osu! profile statistics. Customize the cards' appearance and play mode preferences through URL parameters, and embed them directly into your website or README files.

> [!TIP]
> You can create a card at our website so you can have an easier time [here!](https://osu-profile-stats.vercel.app/editor.html)
> I'll be making some updates to the editor from time to time to make it better!

---

## Features

- You can choose from default, themed, or solid-color backgrounds.
- Display stats for osu, mania, fruits, or taiko modes.
- Use `<img>` tags to display your profile stats SVG anywhere.
- Stats are updated every 5 minutes to prevent API overload (You can host your own deployment following the tutorial [here](#deploying-your-own-instance)).

---

## Usage

Embed the SVG in your project using an `<img>` tag:

```html
<img
    src="https://osu-profile-stats.vercel.app/api/profile-stats/{username}"
    height="150"
    alt="osu stats"
/>
```

> [!NOTE]
> You can adjust size by using the height selection in your `img` tag. Default height is 120.

Replace `{username}` with your osu! username

> [!TIP]
> If you have a space in your username, just put %20 in between, like silly tanese => silly%20tanese.

### URL Parameters

The SVG is customizable through URL parameters:

| Parameter    | Values                                                | Default              | Description                                                                              |
| ------------ | ----------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `background` | `bg1`, `bg2`, `bg3`, `bg4`, `bg5`, `color&hex=11bdb1` | User's default cover | Choose a background. Use color for solid colors by specifying a hex code (without `#`).  |
| `playmode`   | `osu`, `mania`, `fruits`, `taiko`                     | User's default mode  | Select a play mode to display stats for.                                                 |
| `version`    | `mini`, `full`                                        | `mini`               | This selects the type of card, since the old one was a bit ugly I made the mini version. |

---

> [!NOTE]
> Previews are smaller then they actually are because github likes making my stuff smaller.
> You can change it with the height param in the `img` tag.

### Background Examples

Customize your background:

| Background Type | Preview                                                                                                                  | URL                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| default         | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese" alt="default" >                                 | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese`                             |
| `bg1`           | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1" alt="bg1" >                      | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1`              |
| `bg2`           | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2" alt="bg2" >                      | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2`              |
| `bg3`           | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3" alt="bg3" >                      | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3`              |
| `bg4`           | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg4" alt="bg4" >                      | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg4`              |
| `bg5`           | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg5" alt="bg5" >                      | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg5`              |
| Color (solid)   | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=color&hex=11bdb1" alt="Solid Color" > | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=color&hex=11bdb1` |

---

### Play Modes Examples

Display stats for different play modes:

| Play Mode | Preview                                                                                                 | URL                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| osu       | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu" alt="osu" >       | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu`    |
| mania     | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania" alt="mania" >   | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania`  |
| fruits    | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits" alt="fruits" > | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits` |
| taiko     | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=taiko" alt="taiko" >   | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=taiko`  |

---

### Combined Customizations

Combine parameters for detailed customization:

| Customization   | Preview                                                                                                                           | URL                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| mania + bg3     | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3" alt="mania bg3" >          | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3`               |
| osu + Color Hex | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu&background=color&hex=11bdb1" alt="osu Hex" > | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=color&hex=11bdb1` |

---

### Full Cards

Full stats cards function like the minis, but with more data, with same customisation options, just `version=full` added:

| Customization          | Preview                                                                                                                                            | URL                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| full + mania + bg3     | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3&version=full" alt="mania bg3 full">          | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3&version=full`               |
| full + osu + Color Hex | <img src="https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu&background=color&hex=11bdb1&version=full" alt="osu Hex full"> | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=color&hex=11bdb1&version=full` |

---

## Data Caching

- **Update Frequency:** Data is updated every 5 minutes.
- **Caching:** Cached data minimizes API requests to osu! servers.

---

## Contributing

> [!WARNING]
> Ugly code ahead.

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes and open a pull request.
4. Ensure your code follows project conventions and includes documentation.

---

## Deploying Your Own Instance

Detailed deployment instructions can be found [here!](https://github.com/Luis-Tanese/osu-profile-stats/blob/main/DEPLOYMENT.md) (Up to date with new release. Make sure your repo is updated aswell!)

---

### If you have any issues or questions, feel free to dm me in discord at `tanese` or open an issue in this repository

Made with ♥ by Tanese
