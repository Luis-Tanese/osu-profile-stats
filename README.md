# osu-profile-stats

osu-profile-stats generates SVG cards displaying osu! profile statistics. Customize the cards' appearance and play mode preferences through URL parameters, and embed them directly into your website or README files.

---

## Features
- You can choose from default, themed, or solid-color backgrounds.
- Display stats for osu, mania, fruits, or taiko modes.
- Use `<img>` tags to display your profile stats SVG anywhere.
- Stats are updated every 30 minutes to prevent API overload (You can host your own deployment following the tutorial here).

---

## Usage
Embed the SVG in your project using an `<img>` tag:

```html
<img src="https://osu-profile-stats.vercel.app/api/profile-stats/{username}" height="245" alt="osu stats">
```

Replace `{username}` with your osu! username.

### URL Parameters
The SVG is customizable through URL parameters:

| Parameter     | Values                               | Default    | Description                                   |
|---------------|--------------------------------------|------------|-----------------------------------------------|
| `background`  | `default`, `bg1`, `bg2`, `bg3`, `custom&hex=11bdb1` | `default`  | Choose a background. Use custom for solid colors by specifying a hex code (without `#`). |
| `playmode`    | `osu`, `mania`, `fruits`, `taiko`    | User's default mode | Select a play mode to display stats for. |

---

### Background Examples
Customize your background:

| Background Type | Preview                                                              | URL                                                                                      |
|-----------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `default`         | ![default](https://osu-profile-stats.vercel.app/api/profile-stats/tanese) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese`       |
| `bg1`    | ![bg1](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1)        | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg1`          |
| `bg2`    | ![bg2](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2)        | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg2`          |
| `bg3`    | ![bg3](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3)        | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=bg3`          |
| Custom (solid)  | ![Solid Color](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=custom&hex=11bdb1) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?background=custom&hex=11bdb1` |

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
| mania + bg3           | ![mania bg3](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=mania&background=bg3`     |
| fruits + Custom Hex | ![fruits Hex](https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=custom&hex=11bdb1) | `https://osu-profile-stats.vercel.app/api/profile-stats/tanese?playmode=fruits&background=custom&hex=11bdb1` |

---

## Data Caching
- **Update Frequency:** Data is updated every 30 minutes.
- **Caching:** Cached data minimizes API requests to osu! servers.

---

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes and open a pull request.
4. Ensure your code follows project conventions and includes documentation.

---

## Deploying Your Instance (WIP)
### Under Construction
Detailed deployment instructions will be added soon. Stay tuned!

---

Made with ♥ by Tanese
