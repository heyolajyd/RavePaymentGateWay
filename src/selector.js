import { createSelector } from 'reselect';
import { omit } from 'underscore';
import RaveApi from './actions/RaveApi'

// Auth Models
export const PIN = 'PIN'
export const OTP = 'OTP'
export const NO_AUTH = 'NOAUTH'
export const VBVSECURECODE = 'VBVSECURECODE'
export const RANDOM_DEBIT = 'RANDOM_DEBIT'
export const AVS = 'AVS'

// Globals
export const SUCCESS = 'SUCCESS'
export const NEED_TO_VALIDATE = 'NEED_TO_VALIDATE'
export const FAILURE = 'FAILURE'


// Transaction Types
export const CARD = 'CARD'
export const ACCOUNT = 'ACCOUNT'

// Validate Form Type Fields 
const PIN_FIELDS = [
  { placeholder: PIN, field: PIN.toLowerCase(), secureTextEntry: true }
]

const PIN_VAL_FIELD = [
  { placeholder: OTP, field: OTP.toLowerCase() }
]

const RANDOM_DEBIT_FIELDS = [
  { placeholder: 'Amount Charged', field: OTP.toLowerCase() }
]

const ACCOUNT_VAL_FIELDS = [
  { placeholder: OTP, field: OTP.toLowerCase() }
]

const AVS_VAL_FIELDS = [
  { placeholder: 'Verify Address', field: AVS.toLowerCase() }
]

// Selectors
export const selData = (props) => {
  const { 
    amount, firstname, lastname, email, PBFPubKey, txRef, currency, country
  } = props
  
  return { 
    amount, firstname, lastname, email, PBFPubKey, txRef, currency, country
  }
}

export const isAuthSuggested = data => data.suggested_auth ? true : false

// Response Data selectors
export const selChargeToken = data => data.chargeToken || {}
export const selAuthModel = data => data.authModelUsed || data.suggested_auth
export const selChargeRespCode = data => data.chargeResponseCode || (data.tx ? data.tx.chargeResponseCode : data.tx) || ''
export const selCardValRespCode = data => data.vbvrespcode
export const selAcctValRespCode = data => data.acctvalrespcode
export const selCardTxnMessage = data => data.vbvrespmessage || (data.tx ? data.tx.vbvrespmessage : data.tx) || ''
export const selAcctTxnMessage = data => data.acctvalrespmsg
export const selTxnRef = data => data.txRef || ''
export const selFlwRef = data => data.flwRef || ''
export const selAuthUrl = data => data.authurl
export const selFormType = data => data.formType
export const selPaymentType = data => data.paymentType || (data.tx ? data.tx.paymentType : data.tx) || ''

// State Selectors
const selCardDetails = state => state.cardDetails
const selAccountDetails = state => state.accountDetails
const selCurrentTab = state => state.currentTab
const selUseToken = state => state.useToken
const selIsSuggestedAuth = state => state.isSuggestedAuth
const selModel = state => state.authModel

export const selUserToken = createSelector(
  [selChargeToken], chargeToken => chargeToken.user_token || ''
);

export const selChargeRespAction = createSelector(
  [selChargeRespCode], respCode => {
    return respCode === '00' ? SUCCESS : NEED_TO_VALIDATE 
  }
)

export const selPaymentTypeValRespCode = createSelector(
  [selCurrentTab, selChargeRespCode, selAcctValRespCode],
  (currentTab, cardValResp, acctValRespCode) => {
    return CARD === currentTab ? cardValResp : acctValRespCode
  }
)

export const selValRespAction = createSelector(
  [selPaymentTypeValRespCode], respCode => {
    return respCode === '00' ? SUCCESS :  FAILURE
  }
)

export const selPaymentTypeTxnMessage = createSelector(
  [selPaymentType, selCardTxnMessage, selAcctTxnMessage],
  (paymentType, cardTxnMessage, acctTxnMessage) => {
    return CARD.toLowerCase() === paymentType ? cardTxnMessage : acctTxnMessage
  }
)

export const selValDetails = createSelector(
  [selPaymentType, selTxnRef, selFlwRef],
  (paymentType, txRef, transactionReference) => {

    return paymentType === CARD.toLowerCase()
    ? { txRef, 'transaction_reference': transactionReference }
    : { txRef, 'transactionreference': transactionReference }
  }
)

export const selCard = createSelector(
  [selCardDetails, selUseToken, selIsSuggestedAuth, selModel],
  (cardDetails, useToken, isSuggestedAuth, model) => {
    const { shortcode, cvv } = cardDetails
    const details = omit(cardDetails, 'shortcode')

    return useToken 
    ? { shortcode, cvv }
    : (isSuggestedAuth ? { ...details, 'suggested_auth': model } : { ...details })
  }
)

export const selTransaction = createSelector(
  [selCurrentTab, selCard, selAccountDetails, selData],
  (currentTab, cardDetails, accountDetails, otherData) => {
    switch (currentTab) {
      case CARD:
        return RaveApi.chargeCard({ ...cardDetails, ...otherData })
      case ACCOUNT:
        return RaveApi.chargeAccount({ ...accountDetails, ...otherData})
    }
  }
)

export const selValidationBtnLabel = createSelector(
  [selModel, selIsSuggestedAuth],
  (authModel, isSuggestedAuth) => {
    switch (authModel) {
      case PIN:
        return isSuggestedAuth ? 'CONTINUE' : 'VALIDATE OTP'
      case ACCOUNT:
        return 'VALIDATE OTP'
      default:
        return 'CONTINUE'
    }
  }
)

export const selFormTypeFields = createSelector(
  [selModel, selIsSuggestedAuth],
  (authModel, isSuggestedAuth) => {
    switch (authModel) {
      case RANDOM_DEBIT:
        return RANDOM_DEBIT_FIELDS
      case PIN:
        return isSuggestedAuth ? PIN_FIELDS : PIN_VAL_FIELD
      case ACCOUNT:
        return ACCOUNT_VAL_FIELDS
      case AVS:
        return AVS_VAL_FIELDS
      default:
        return []
    }
  }
)
