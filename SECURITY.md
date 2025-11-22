# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ZK-PayLink, please report it responsibly:

**DO NOT** open a public issue.

Instead, please email: security@zk-paylink.xyz

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

### For API Users

1. **Never expose your merchant address publicly** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Validate webhook signatures** (when implemented)
4. **Use HTTPS only** for API calls
5. **Implement rate limiting** on your end

### For Payment Recipients

1. **Verify payments on-chain** before fulfilling orders
2. **Check the `zkCommitment`** field for privacy-enabled payments
3. **Monitor for duplicate payments** using `orderId`
4. **Set appropriate expiration times** for payment requests

## What We Do

- ✅ Non-custodial (we never hold funds)
- ✅ No private keys stored
- ✅ HTTPS only
- ✅ Regular security audits
- ✅ Open source code

## What We Don't Do

- ❌ Store wallet private keys
- ❌ Have access to user funds
- ❌ Log sensitive payment details
- ❌ Share data with third parties

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Known Limitations

- Payment links expire after 15 minutes
- ZK commitments are generated client-side
- Blockchain confirmation times vary (typically 1-2 seconds)

---

**Last Updated**: November 2025
