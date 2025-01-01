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
<img src="https://osu-profile-stats.vercel.app/api/profile-stats/{username}" height="245" alt="osu stats">
```
> [!NOTE]
> You can adjust size by using the height selection in your `img` tag. Default height is 200.

Replace `{username}` with your osu! username
> [!TIP]
> If you have a space in your username, just put %20 in between, like silly tanese => silly%20tanese.

### URL Parameters
The SVG is customizable through URL parameters:

| Parameter     | Values                               | Default    | Description                                   |
|---------------|--------------------------------------|------------|-----------------------------------------------|
| `background` | `bg1`, `bg2`, `bg3`, `bg4`, `bg5`, `color&hex=11bdb1` | User's default cover | Choose a background. Use color for solid colors by specifying a hex code (without `#`). |
| `playmode` | `osu`, `mania`, `fruits`, `taiko` | User's default mode | Select a play mode to display stats for. |
| `version` | `mini`, `full` | `mini` | This selects the type of card, since the old one was a bit ugly I made the mini version. |


---

### Background Examples
Customize your background:

| Background Type | Preview                                                              | URL                                                                                      |
|-----------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `default` | ![default](https://osu-profile-stats.vercel.app/api/profile-stats/tanese) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese` |
| `bg1` | ![bg1](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1` |
| `bg2` | ![bg2](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2` |
| `bg3` | ![bg3](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3` |
| `bg4` | ![bg4](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg4) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg4` |
| `bg5` | ![bg5](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg5) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg5` |
| Color (solid) | ![Solid Color](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=color&hex=11bdb1) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=color&hex=11bdb1` |

---

### Play Modes Examples
Display stats for different play modes:

| Play Mode | Preview                                                              | URL                                                                                       |
|-----------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| osu       | ![osu](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu`             |
| mania     | ![mania](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania`           |
| fruits    | ![fruits](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits`         |
| taiko     | ![taiko](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=taiko) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=taiko`           |

---

### Combined Customizations
Combine parameters for detailed customization:

| Customization       | Preview                                                              | URL                                                                                              |
|---------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| mania + bg3 | ![mania bg3](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3` |
| osu + Color Hex | ![fruits Hex](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu&background=color&hex=11bdb1) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=color&hex=11bdb1` |

---

### Full Cards
Full stats cards function like the minis, but with more data, with same customisation options, just `version=full` added:

| Customization       | Preview                                                              | URL                                                                                              |
|---------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| full + mania + bg3 | ![mania bg3](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3&version=full) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3&version=full` |
| full + osu + Color Hex | ![fruits Hex](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=osu&background=color&hex=11bdb1&version=full) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=color&hex=11bdb1&version=full` |

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
