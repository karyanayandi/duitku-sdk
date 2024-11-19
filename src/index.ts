import crypto from "crypto"
import axios, { type AxiosError, type AxiosResponse } from "axios"

export type PaymentMethodCode =
  // Virtual Account
  | "A1" // ATM Bersama
  | "AG" // Bank Artha Graha
  | "B1" // CIMB Niaga Virtual Account
  | "BC" // BCA Virtual Account
  | "BR" // BRIVA
  | "BT" // Permata Bank Virtual Account
  | "BV" // BSI Virtual Account
  | "DM" // Danamon Virtual Account
  | "I1" // BNI Virtual Account
  | "M2" // Mandiri Virtual Account
  | "NC" // Bank Neo Commerce / BNC
  | "S1" // Bank Sahabat Sampoerna
  | "VA" // Maybank Virtual Account
  | "VC" // Visa / Mastercard / JCB
  // Ritel
  | "FT" // Pegadaian / ALFA / Pos
  | "IR" // Indomaret
  // E-Wallet
  | "DA" // DANA
  | "JP" // Jenius Pay
  | "LA" // LinkAja Apps (Percentage Fee)
  | "LF" // LinkAja Apps (Fixed Fee)
  | "OL" // OVO Account Link
  | "OV" // OVO (Support Void)
  | "SA" // Shoppe Pay Apps (Support Void)
  | "SL" // Shoppe Pay Account Link
  // QRIS
  | "DQ" // DANA
  | "GQ" // Gudang Voucher
  | "LQ" // LinkAja
  | "NQ" // Nobu
  | "SP" // Shopee Pay
  | "SQ" // Nuaspay
  // Kredit
  | "DN" // Indodana Paylater
  | "AT" // ATOME

export interface DuitkuConfigProps {
  apiKey: string
  merchantCode: string
  isProduction?: boolean
}

export interface DuitkuInputProps {
  getPaymentMethod: (
    props: GetPaymentMethodInputProps,
  ) => Promise<GetPaymentMethodReturnProps>
  createTransaction: (
    props: CreateTransactionInputProps,
  ) => Promise<CreateTransactionReturnProps>
  createTransactionOVO: (
    props: CreateTransactionOVOInputProps,
  ) => Promise<CreateTransactionReturnProps>
  checkTransaction: (
    merchantOrderId: string,
  ) => Promise<CheckTransactionReturnProps>
}

export interface GetPaymentMethodInputProps {
  amount: number
  datetime: string
}

interface PaymentFee {
  paymentMethod: string
  paymentName: string
  paymentImage: string
  totalFee: string
}

export interface GetPaymentMethodReturnProps extends AxiosResponse {
  paymentFee: PaymentFee[]
  responseCode: string
  responseMessage: string
}

interface TransactionInput {
  paymentAmount: number
  merchantOrderId: string
  productDetails: string
  email: string
  additionalParam?: string
  merchantUserInfo?: string
  phoneNumber?: string
  customerVaName: string
  itemDetails?: ItemDetails
}

export interface CreateTransactionInputProps extends TransactionInput {
  paymentMethod: PaymentMethodCode
  customerDetails?: CustomerDetails
  returnUrl: string
  callbackUrl: string
  expiryPeriod?: number // in minutes (default value: https://docs.duitku.com/api/id/?php#expiry-period)
  accountLink?: AccountLink
  creditCardDetail?: CreditCardDetail
}

export interface CreateTransactionOVOInputProps extends TransactionInput {}

interface ItemDetails {
  name: string
  quantity: number
  price: number
}

interface CustomerDetails {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  billingAddress?: Address
  shippingAddress?: Address
}

interface Address {
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  postalCode?: string
  phone?: string
  countryCode?: string
}

interface AccountLink {
  credentialCode: string
  ovo: OvoDetail
  shoppe: ShopeeDetail
}

interface OvoDetail {
  paymentDetails: string[]
  paymentType: string
  amount: number
}

interface ShopeeDetail {
  promo_ids: string
  useCoin: boolean
}

interface CreditCardDetail {
  acquirer?: string
  binWhitelist?: string[]
}

export interface CreateTransactionReturnProps extends AxiosResponse {
  merchantCode: string
  reference: string
  paymentUrl: string
  vaNumber: string
  qrString: string
  amount: string
  statusCode: string
  statusMessage: string
}

export interface CheckTransactionReturnProps extends AxiosResponse {
  merchantOrderId: string
  reference: string
  amount: string
  fee: string
  statusCode: string
  statusMessage: string
}

export default function createDuitkuConfig({
  apiKey,
  merchantCode,
  isProduction = false,
}: DuitkuConfigProps): DuitkuInputProps {
  const endpoint = isProduction
    ? "https://passport.duitku.com/webapi/api/merchant"
    : "https://sandbox.duitku.com/webapi/api/merchant"

  const getPaymentMethod = async (
    props: GetPaymentMethodInputProps,
  ): Promise<GetPaymentMethodReturnProps> => {
    const payload = {
      ...props,
      merchantcode: merchantCode,
      signature: crypto
        .createHmac("sha256", apiKey)
        .update(merchantCode + props.amount + props.datetime)
        .digest("hex"),
    }

    try {
      const { data } = await axios.post<GetPaymentMethodReturnProps>(
        `${endpoint}/paymentmethod/getpaymentmethod`,
        payload,
      )
      return data
    } catch (error) {
      const axiosError = error as AxiosError<unknown>
      if (axiosError.response) {
        const { status, data } = axiosError.response
        let errorMessage = "Unknown error occurred"
        if (typeof data === "string") {
          errorMessage = data
        } else if (data && typeof data === "object" && "message" in data) {
          errorMessage = data.message as string
        }
        throw new Error(`Request failed with status ${status}: ${errorMessage}`)
      } else if (axiosError.request) {
        throw new Error("No response received from the server")
      } else {
        throw new Error("Error setting up the request")
      }
    }
  }

  const createTransaction = async (
    props: CreateTransactionInputProps,
  ): Promise<CreateTransactionReturnProps> => {
    const payload = {
      ...props,
      merchantcode: merchantCode,
      signature: crypto
        .createHash("md5")
        .update(
          merchantCode + props.merchantOrderId + props.paymentAmount + apiKey,
        )
        .digest("hex"),
    }

    try {
      const { data } = await axios.post<CreateTransactionReturnProps>(
        `${endpoint}/v2/inquiry`,
        payload,
      )
      return data
    } catch (error) {
      const axiosError = error as AxiosError<unknown>
      if (axiosError.response) {
        const { status, data } = axiosError.response
        let errorMessage = "Unknown error occurred"
        if (typeof data === "string") {
          errorMessage = data
        } else if (data && typeof data === "object" && "message" in data) {
          errorMessage = data.message as string
        }
        throw new Error(`Request failed with status ${status}: ${errorMessage}`)
      } else if (axiosError.request) {
        throw new Error("No response received from the server")
      } else {
        throw new Error("Error setting up the request")
      }
    }
  }

  // OVO Payment Method without Redirect
  const createTransactionOVO = async (
    props: CreateTransactionOVOInputProps,
  ): Promise<CreateTransactionReturnProps> => {
    const payload = {
      ...props,
      merchantcode: merchantCode,
      signature: crypto
        .createHash("md5")
        .update(
          merchantCode + props.merchantOrderId + props.paymentAmount + apiKey,
        )
        .digest("hex"),
    }

    try {
      const { data } = await axios.post<CreateTransactionReturnProps>(
        `${endpoint}/ovo/createtransaction`,
        payload,
      )
      return data
    } catch (error) {
      const axiosError = error as AxiosError<unknown>
      if (axiosError.response) {
        const { status, data } = axiosError.response
        let errorMessage = "Unknown error occurred"
        if (typeof data === "string") {
          errorMessage = data
        } else if (data && typeof data === "object" && "message" in data) {
          errorMessage = data.message as string
        }
        throw new Error(`Request failed with status ${status}: ${errorMessage}`)
      } else if (axiosError.request) {
        throw new Error("No response received from the server")
      } else {
        throw new Error("Error setting up the request")
      }
    }
  }

  const checkTransaction = async (
    merchantOrderId: string,
  ): Promise<CheckTransactionReturnProps> => {
    const payload = {
      merchantCode,
      merchantOrderId,
      signature: crypto
        .createHash("md5")
        .update(merchantCode + merchantOrderId + apiKey)
        .digest("hex"),
    }

    try {
      const { data } = await axios.post(
        `${endpoint}/transactionStatus`,
        payload,
      )

      return data
    } catch (error) {
      const axiosError = error as AxiosError<unknown>
      if (axiosError.response) {
        const { status, data } = axiosError.response
        let errorMessage = "Unknown error occurred"
        if (typeof data === "string") {
          errorMessage = data
        } else if (data && typeof data === "object" && "message" in data) {
          errorMessage = data.message as string
        }
        throw new Error(`Request failed with status ${status}: ${errorMessage}`)
      } else if (axiosError.request) {
        throw new Error("No response received from the server")
      } else {
        throw new Error("Error setting up the request")
      }
    }
  }

  return {
    getPaymentMethod,
    createTransaction,
    createTransactionOVO,
    checkTransaction,
  }
}
