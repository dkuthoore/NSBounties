# NS Bounties 🤑

A permissionless bounty platform enabling users to create and track USDC-based bounties with enhanced multi-wallet connectivity and mobile experiences.

## Features

- Next.js frontend with TypeScript and RainbowKit
- USDC payment integration with comprehensive wallet support
- Multi-wallet connection (Metamask, Rainbow, Coinbase, Phantom)
- Dynamic bounty creation, management, and listing
- Creator-specific bounty actions (delete, status change, payment)
- Responsive mobile-first design

## Tech Stack

- Frontend: React + TypeScript + Vite
- State Management: TanStack Query (React Query)
- Styling: Tailwind CSS + shadcn/ui
- Wallet Integration: RainbowKit + wagmi
- Smart Contract Integration: viem
- Database: PostgreSQL + Drizzle ORM
- API: Express.js

## Getting Started

1. Clone the repository
```bash
git clone <your-repo-url>
cd ns-bounties
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add the following variables:
```env
DATABASE_URL=your_postgres_connection_string
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── pages/      # Page components
├── server/              # Backend application
├── shared/              # Shared types and schemas
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
