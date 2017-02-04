import { createSelector } from 'reselect';
import { omit } from 'underscore';
import RaveApi from './actions/RaveApi'

// Auth Models
export const PIN = 'PIN'
export const OTP = 'OTP'
export const NO_AUTH = 'NOAUTH'
export const VBVSECURECODE = 'VBVSECURECODE'
export const RANDOM_DEBIT = 'RANDOM_DEBIT'

// Globals
export const SUCCESS = 'SUCCESS'
export const NEED_TO_VALIDATE = 'NEED_TO_VALIDATE'
export const FAILURE = 'FAILURE'


// Transaction Types
export const CARD = 'CARD'
export const ACCOUNT = 'ACCOUNT'

// Validate Form Type Fields 
const PIN_FIELDS = [
  { placeholder: OTP, field: OTP.toLowerCase() }
]

const RANDOM_DEBIT_FIELDS = [
  { placeholder: 'Amount Charged', field: OTP.toLowerCase() }
]

const ACCOUNT_VAL_FIELDS = [
  { placeholder: OTP, field: OTP.toLowerCase() }
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

// Response Data selectors
export const selChargeToken = data => data.chargeToken || {}
export const selAuthModel = data => data.authModelUsed
export const selChargeRespCode = data => data.chargeResponseCode
export const selCardValRespCode = data => data.vbvrespcode
export const selAcctValRespCode = data => data.acctvalrespcode
export const selCardTxnMessage = data => data.vbvrespmessage
export const selAcctTxnMessage = data => data.acctvalrespmsg
export const selTxnRef = data => data.txRef
export const selFlwRef = data => data.flwRef
export const selAuthUrl = data => data.authurl
export const selFormType = data => data.formType
export const selPaymentType = data => data.paymentType

// State Selectore
const selCardDetails = state => state.cardDetails
const selAccountDetails = state => state.accountDetails
const selCurrentTab = state => state.currentTab
const selUseToken = state => state.useToken


export const selUserToken = createSelector(
  [selChargeToken], chargeToken => chargeToken.user_token
);

export const selChargeRespAction = createSelector(
  [selChargeRespCode], respCode => {
    return respCode === '00' ? SUCCESS : NEED_TO_VALIDATE 
  }
)

export const selPaymentTypeValRespCode = createSelector(
  [selPaymentType, selCardValRespCode, selAcctValRespCode],
  (paymentType, cardValRespCode, acctValRespCode) => {
    return CARD.toLowerCase() === paymentType ? cardValRespCode : acctValRespCode
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
    : { txRef }
  }
)

export const selCard = createSelector(
  [selCardDetails, selUseToken],
  (cardDetails, useToken) => {
    const { shortcode, cvv } = cardDetails
    return useToken 
    ? { shortcode, cvv }
    : omit(cardDetails, 'shortcode')
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

export const selValidationBtnLabel = authModel => {
  switch (authModel) {
    case RANDOM_DEBIT:
      return 'CONTINUE'
    case PIN:
      return 'VALIDATE OTP'
    case VBVSECURECODE:
      return 'CONTINUE'
    case ACCOUNT:
      return 'VALIDATE OTP'
  }
}

export const selFormTypeFields = authModel => {
  switch (authModel) {
    case RANDOM_DEBIT:
      return RANDOM_DEBIT_FIELDS
    case PIN:
      return PIN_FIELDS
    case ACCOUNT:
      return ACCOUNT_VAL_FIELDS
    default:
      return []
  }
}

// Util methods
export const formatCardNumber = (value) => {
    return value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()
}

export const formatExpiryDate = (currValue, prevValue) => {
  if (currValue.length === 2 && (prevValue.length === 1)) {
    return currValue += ' / '
  }
  return currValue
}

export const formatAmount = (amount) => {
  const val = [null, undefined].includes(amount) ? 0 : amount
  return parseFloat(val).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

export const formatCurrencyAmountLabel = (props) => {
  return `PAY ${props.currency} ${formatAmount(props.amount)}`
}

export const getQueryParams = (str) => {
  const queryString = {}
  url = str.split('?')[1]
  url.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function($0, $1, $2, $3) { queryString[$1] = $3 })
  return queryString
}

export const cardTypeFromNumber = (number) => {
  // Visa
  var re = new RegExp('^4');
  if (number.match(re) != null)
    return 'Visa';

  // Mastercard
  re = new RegExp('^5[1-5]');
  if (number.match(re) != null)
    return 'Mastercard';
  
  return '';
};

export const formatCreditCard = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || ''
  const parts = []
  for (i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}
