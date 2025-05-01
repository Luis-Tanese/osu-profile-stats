# Deploying Your Own Instance on Vercel

Easily deploy your own instance to reduce the delay (from 5 minutes) to be instant!

## Prerequisites

1. **GitHub Account**  
   If you don’t have one, [create a GitHub account](https://github.com/signup).

2. **Vercel Account**  
   You’ll need a [Vercel account](https://vercel.com) for deployment. Login with your github account for easier access.

---

## Step 1: Set Up Your GitHub Repository

1. **Create a Repository**

    - Go to GitHub and create a new repository. This will host all the project files for Vercel.

2. **Upload the Files**

    - Clone this repository by clicking the green **Code** button:  
      ![Code Button](https://github.com/user-attachments/assets/fad5da4e-a261-4891-a4ad-80d2cb1c4a14)  
      Copy the repository link and run:
        ```bash
        git clone https://github.com/Luis-Tanese/osu-profile-stats.git
        ```
    - Alternatively, download the ZIP file and extract its contents.

3. **Upload Content to Your Repository**
    - Navigate to the folder containing the `osu-profile-stats` files, select all files, and drag them into the **Upload Files** section on GitHub:  
      ![Selecting Files](https://github.com/user-attachments/assets/a4a80ac1-e883-49a3-89bf-4260b517aa84)
      ![Upload Files](https://github.com/user-attachments/assets/d39e47aa-a3a4-4461-ac14-d0cd29b1a78b)
    - Commit the changes to the `main` branch.

---

## Step 2: Deploy on Vercel

1. **Log in to Vercel**

    - Go to [Vercel](https://vercel.com) and sign up or log in using your GitHub account.

2. **Import Your GitHub Repository**

    - Click **Add New** → **Project**:  
      ![Add New Project](https://github.com/user-attachments/assets/e078c78d-77b0-44b4-8c98-8ed04dfc05e7)
    - Select the repository you created earlier and click **Import**:  
      ![Import Repository](https://github.com/user-attachments/assets/f5fe2239-7343-4af5-b0c9-a51f64b941e0)

3. **Configure Project Settings**
    - Choose a project name. If the desired URL is unavailable, you’ll get a random URL, which can be customized in **Settings** → **Domains**:  
      ![Domain Settings](https://github.com/user-attachments/assets/1495e73f-a0fc-466a-8813-4a1bbbcc2763)

---

## Step 3: Obtain and Configure osu! API Credentials

1. **Generate an OAuth Application**

    - Log in to [osu!](https://osu.ppy.sh), click your profile icon, and go to **Settings** → **OAuth** → **New OAuth Application**:  
      ![New OAuth Application](https://github.com/user-attachments/assets/134b53dd-fab2-4347-963a-0a34be6ab8b8)
    - Set the **Callback URL** to:
        ```
        https://your-url.vercel.app/api/callback
        ```
    - Save your **Client ID** and **Client Secret** (keep them secure! ＞︿＜).

2. **Add Environment Variables in Vercel**
    - Go to your project in Vercel → **Settings** → **Environment Variables**:  
      ![Environment Variables](https://github.com/user-attachments/assets/7281cd1b-a7d5-4c9b-806e-71bf1d9f3cdb)
    - Add the following variables:
        - `OSU_CLIENT_ID` → Your osu! **Client ID**
        - `OSU_CLIENT_SECRET` → Your osu! **Client Secret**  
          ![Environment Variables Example](https://github.com/user-attachments/assets/b71f3a7c-ec77-430c-a743-7eca39d89c0f)
    - Click **Save**.

---

## Step 4: Update the Server Code

1. **Edit `server.js`**

    - In your GitHub repository, locate and edit the `server.js` file:  
      ![Edit Server File](https://github.com/user-attachments/assets/4952a354-ad8d-404e-b544-79452e9dc049)
    - Replace the content with the contents of this file (Simply copy and paste the file's contents into your server.js file):
      https://github.com/Luis-Tanese/osu-profile-stats/blob/main/deploymentTestServer.js
    - Commit the changes.

2. **Wait for Deployment**
    - Within ~1 minute, your website should be live! Test it by visiting:
        ```
        https://your-url.vercel.app/api/profile-stats/{username}
        ```

---

## Embedding the Profile Stats

You can embed your osu! stats into other websites or README files using the following HTML tag:

```html
<img
    src="https://your-url.vercel.app/api/profile-stats/{username}"
    height="245"
    alt="osu stats"
/>
```

---

## Need Help?

If you encounter any issues, feel free to:

-   DM me on Discord: **tanese**
-   Open an issue in this repository.
