import DeviceInfo  from 'react-native-device-info'
import { createSelector } from 'reselect';

// Auth Models
export const VBVSECURECODE = 'VBVSECURECODE'
export const PIN = 'PIN'
export const OTP = 'OTP'
export const RANDOM_DEBIT = 'Random_Debit'
export const NO_AUTH = 'no_auth'

// Globals
export const SUCCESS = 'successful'
export const NEED_TO_VALIDATE = 'pending'
export const APPROVED_MESSAGE = 'Approved. Successful'

// Validate Form Type Fields 
const PIN_FIELDS = [
  { placeholder: PIN, field: PIN.toLowerCase() }, 
  { placeholder: OTP, field: OTP.toLowerCase() }
]
const RANDOM_DEBIT_FIELDS = [
  { placeholder: 'Amount Charged', field: OTP.toLowerCase() }
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

const selChargeToken = data => `For Future Payments use token: ${data.chargeToken || {}}`
const selAuthModel = data => data.authModelUsed
const selResponseCode = data => data.chargeResponseCode
const selResponseMessage = data => data.chargeResponseMessage
const selTxnRef = data => data.txRef
const selFormType = data => data.formType

export const selUserToken = createSelector(
  [selChargeToken], chargeToken => chargeToken.user_token
);

export const selResponseAction = createSelector(
  [selResponseCode], responseCode => {
    return responseCode === '00' ? SUCCESS : NEED_TO_VALIDATE 
  }
)

export const selValidationBtnLabel = authModel => {
  switch (authModel) {
    case RANDOM_DEBIT:
      return 'CONTINUE'
    case PIN:
      return 'VALIDATE'
  }
}

export const selFormTypeFields = authModel => {
  switch (authModel) {
    case RANDOM_DEBIT:
      return RANDOM_DEBIT_FIELDS
    case PIN:
      return PIN_FIELDS
    default:
      return []
  }
}

// Util methods
export const formatCardNumber = (value) => {
    return value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()
}

export const formatExpiryDate = (currValue, prevValue) => {
  if (currValue.length == 2 && prevValue.length == 1) {
    return currValue += ' / '
  }
  return currValue
}

export const formatAmount = (amount) => {
  const val = [null, undefined].includes(amount) ? 0 : amount
  return parseFloat(val).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

export const formatCurrencyAmountLabel = (props) => {
  return `PAY ${props.currency} ${formatAmount(props.amonut)}`
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
