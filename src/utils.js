import DeviceInfo  from 'react-native-device-info'
import { createSelector } from 'reselect';

export const selData = (props) => {
  const { 
    amount, firstname, lastname, email, PBFPubKey, txRef, currency, country
  } = props
  
  return { 
    amount,
    firstname, 
    lastname, 
    email,
    PBFPubKey,
    txRef,
    currency,
    country
  }
}


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
