# NSJWF Admin

Built with Typescript, React, Zustand, Vite

## Requirements

    NodeJS 18+

## Local setup

Install dependencies:

    npm i

Create .env file:

    VITE_API_URL={your_api_route}

Run dev server:

    npm run dev

## Deployment

Create project on Vercel, then add env variable:

    VITE_API_URL={your_api_url_here}

Add vercel.json to the root folder of the project:

    {
        "rewrites":  [
            {"source": "/(.*)", "destination": "/"}
        ]
    }

## Related

https://github.com/nhxv/nsjwf-admin-api
