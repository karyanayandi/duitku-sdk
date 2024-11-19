# Duitku Client Library

## Motivation
I created this library based on Duitku v2 documentation because the official Duitku Node.js library is not open-source and lacks TypeScript support.

## Installation

```sh
pnpm add duitku-sdk
# or
npm install duitku-sdk
# or
yarn add duitku-sdk
# or
bun add duitku-sdk
```

## API

### Create Duitku Config
```js
import createDuitkuConfig from "duitku-sdk"

const duitku = createDuitkuConfig({
    apiKey: [your duitku api key],
    merchantCode: [your duitku merchant code],
    isProduction: [true | false]
})
```

#### Get Payment Method
```js
const paymentMethod = await duitku.getPaymentMethod({
    amount: [amount],
    dateTime: [dateTime],
});
```

#### Create Transaction
```js
const transaction = await duitku.creaeteTransaction({
    paymentAmount: [paymentAmount],
    merchantOrderId: [merchantOrderId],
    productDetails: [productDetails],
    email: [email],
    paymentMethod: [paymentMethod],
    returnURL: [returnURL],
    callbackURL: [callbackURL],
    expiryPeriod: [expiryPeriod], // in minutes (default value: https://docs.duitku.com/api/id/?php#expiry-period)
});
```

#### Create Transaction OVO without redirect
```js
const transaction = await duitku.createTransactionOVO({
    paymentAmount: [paymentAmount],
    merchantOrderId: [merchantOrderId],
    productDetails: [productDetails],
    email: [email],
});
```

#### Check Transaction
```js
const status = await duitku.checkTransaction('merchantOrderId');
```
```

NOTE:
* Payment Method Code List
  - A1 (ATM Bersama)
  - AG (Bank Artha Graha)
  - B1 (CIMB Niaga Virtual Account)
  - BC (BCA Virtual Account)
  - BR (BRIVA)
  - BT (Permata Bank Virtual Account)
  - BV (BSI Virtual Account)
  - DM (Danamon Virtual Account)
  - I1 (BNI Virtual Account)
  - M2 (Mandiri Virtual Account)
  - NC (Bank Neo Commerce / BNC)
  - S1 (Bank Sahabat Sampoerna)
  - VA (Maybank Virtual Account)
  - VC (Visa / Mastercard / JCB)
  - FT (Pegadaian / ALFA / Pos)
  - IR (Indomaret)
  - DA (DANA)
  - JP (Jenius Pay)
  - LA (LinkAja Apps (Percentage Fee))
  - LF (LinkAja Apps (Fixed Fee))
  - OL (OVO Account Link)
  - OV (OVO (Support Void))
  - SA (Shoppe Pay Apps (Support Void))
  - SL (Shoppe Pay Account Link)
  - DQ (DANA)
  - GQ (Gudang Voucher)
  - LQ (LinkAja)
  - NQ (Nobu)
  - SP (Shopee Pay)
  - SQ (Nuaspay)
  - DN (Indodana Paylater)
  - AT (ATOME)

### Callback (Coming Soon)
