# Android AAB Signer

> Sign your Android App Bundles securely and transparently — no technical expertise required.

A free, open-source web application that signs Android App Bundle (AAB) files for Google Play Store submission. Built with security and transparency as core principles.

**A project by [TestersCommunity](https://www.testerscommunity.com)** — Empowering developers with tools that just work.

---

## Why Use This Tool?

Signing an AAB file typically requires command-line knowledge, Java installation, and understanding of `jarsigner`. This tool eliminates all of that:

- **Simple Upload Experience** — Drag, drop, and download your signed AAB
- **No Installation Required** — Works entirely in your browser
- **100% Transparent** — All processing happens on GitHub Actions (fully auditable)
- **Zero Data Retention** — Your keystore and passwords are deleted immediately after signing
- **Open Source** — Every line of code is visible for security review

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   Upload    │────▶│   Secure    │────▶│   GitHub Actions    │────▶│   Download   │
│  AAB + Key  │     │   Transfer  │     │   Signs Your AAB    │     │  Signed AAB  │
└─────────────┘     └─────────────┘     └─────────────────────┘     └──────────────┘
```

1. **Upload** your unsigned AAB and keystore file
2. **Enter** your keystore password, key alias, and key password
3. **Wait** ~30 seconds while GitHub Actions signs your bundle
4. **Download** your signed AAB, ready for Play Store upload

---

## Security First

We take security seriously. Here's what happens to your sensitive files:

| Your Data | What Happens |
|-----------|--------------|
| **Keystore** | Uploaded via HTTPS, used for signing, **deleted immediately** |
| **Passwords** | Masked in all logs, never stored, exist only in memory |
| **AAB Files** | Processed and deleted — only signed output remains |
| **User Data** | We don't collect any. Zero analytics. Zero tracking. |

### Security Guarantees

- Passwords are masked before ANY logging occurs
- Cleanup runs **even if signing fails** (using `if: always()`)
- Processing happens on ephemeral GitHub VMs that are destroyed after each job
- No database, no persistent storage, no copies retained
- 100% open source — audit the code yourself

---

## Requirements

### Files You Need

| File | Accepted Formats | Max Size |
|------|------------------|----------|
| **Unsigned AAB** | `.aab` | 100 MB |
| **Keystore** | `.jks`, `.keystore`, `.p12`, `.pfx` | 10 MB |

### Information You Need

- **Keystore Password** — The password that unlocks your keystore file
- **Key Alias** — The name of the signing key within your keystore
- **Key Password** — The password for the specific key (often same as keystore password)

### Don't Have a Keystore?

Create one using Android Studio or the command line:

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Hosting | Vercel |
| Processing | GitHub Actions |
| Signing | jarsigner (Java SDK) |

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/Testers-Community/android-aab-signer.git
cd android-aab-signer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your GitHub token and repo details

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```bash
GITHUB_TOKEN=           # Personal Access Token with repo access
GITHUB_OWNER=           # GitHub username or organization
GITHUB_REPO=            # Repository name for processing
```

---

## Limitations

| Limit | Value | Reason |
|-------|-------|--------|
| Max AAB size | 100 MB | GitHub Release API limit |
| Signing timeout | 10 minutes | GitHub Actions job timeout |
| Download availability | 24 hours | Artifact retention period |

---

## Troubleshooting

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| "keystore was tampered with" | Wrong keystore password | Double-check your password |
| "alias does not exist" | Wrong key alias | Run `keytool -list -keystore your.jks` to see aliases |
| "signature not valid" | Corrupted AAB | Rebuild your AAB file |

---

## About TestersCommunity

This project is built and maintained by **[TestersCommunity](https://www.testerscommunity.com/#community-app)** — a community dedicated to helping developers ship better apps.

We believe in:
- **Empowering Developers** — Building free tools that solve real problems
- **Transparency** — Open-source solutions you can trust and audit
- **Community** — Sharing knowledge and helping each other succeed

**[Join our community](https://www.testerscommunity.com/#community-app)** to connect with fellow developers, get early access to tools, and help shape what we build next.

---

## Contributing

We welcome contributions! Please ensure any PR:

- Does not add logging of sensitive data
- Does not add analytics or tracking
- Maintains the `if: always()` cleanup pattern
- Keeps `::add-mask::` as the first workflow step

See [CLAUDE.md](./CLAUDE.md) for detailed security guidelines.

Have questions about contributing? Email us at [support@testerscommunity.com](mailto:support@testerscommunity.com).

---

## License

MIT License — Use it, modify it, share it.

---

## Support

Having trouble? Here's how to get help:

- **Email** — Reach us at [support@testerscommunity.com](mailto:support@testerscommunity.com)
- **Issues** — Open a [GitHub Issue](../../issues) for bugs or feature requests
- **Community** — Join [TestersCommunity](https://www.testerscommunity.com/#community-app) for discussions
- **Security** — Found a vulnerability? Please report it privately via email or GitHub Security Advisories

---

<p align="center">
  <strong>Built with care by <a href="https://www.testerscommunity.com/#community-app">TestersCommunity</a></strong><br>
  Helping developers ship better apps, one tool at a time.
</p>
