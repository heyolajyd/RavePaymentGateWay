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
