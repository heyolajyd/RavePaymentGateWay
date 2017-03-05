import { omit } from 'underscore'
import NetworkInfo from 'react-native-network-info'
import { AsyncStorage } from 'react-native'
import cryptico from 'cryptico'

const ROOT_URL = 'http://flw-pms-dev.eu-west-1.elasticbeanstalk.com'
const API_URL = '/flwv3-pug/getpaidx/api'

const BANKS_URL = '/banks'
const GET_CHARGED_URL = `${API_URL}/charge`
const VALIDATE_ACCOUNT_URL = `${API_URL}/validate`
const VALIDATE_CARD_URL =  `${API_URL}/validatecharge`

const STORAGE_KEY = 'embeddedToken'

let IP = null
const requestBody = (data, method) => {
  return method === 'GET' ?
    null : JSON.stringify(data);
};

NetworkInfo.getIPAddress(ip => IP = ip)

const processRequest = (path, method, data) => {
  const url = ROOT_URL + path
  return fetch(url, {
    method  : method,
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    },
    body: requestBody(data, method)
  })
  .then(response => response.json())
  .catch(err => {
    throw err
  });
}

const getCardNumber = (cardno) => {
  return cardno ? cardno.replace(/\s?/g, '') : ''
}

const getExpiryDate = (expirydate) => {
  return expirydate ? expirydate.match(/\d+/g) : ''
}

class RaveApi {
  static PublicKey = 'baA/RgjURU3I0uqH3iRos3NbE8fT+lP8SDXKymsnfdPrMQAEoMBuXtoaQiJ1i5tuBG9EgSEOH1LAZEaAsvwClw==';

  static RootUrl = ROOT_URL
  
  static getAllBanks() {
    return processRequest(BANKS_URL, 'GET')
  }

  static getEmbeddedToken = async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value;
  }

  static setEmbeddedToken = async(value) => {
    AsyncStorage.setItem(STORAGE_KEY, value);
  }

  static serializeCardDetails(cardDetails) {
    const { cardno, expirydate, ...rest } = cardDetails
    const datesArr = getExpiryDate(expirydate)
    console.log(cardDetails);
    return {
      IP,
      cardno: getCardNumber(cardno),
      expirymonth: datesArr[0],
      expiryyear: datesArr[1],
      meta: [],
      ...rest
    }
  }
  
  static serializeAccountDetails(accountDetails) {
    return {
      IP,
      meta: [],
      narration: null,
      passcode: null,
      payment_type: 'account',
      ...accountDetails
    }
  }
  
  static getPayload(requestChargeData) {
    return {
      PBFPubKey: requestChargeData.PBFPubKey,
      client   : cryptico.encrypt(JSON.stringify(requestChargeData), this.PublicKey).cipher
    }  
  }
  
  static processPayment(url, payload) {
    return new Promise((resolve, reject) => {
      processRequest(url, 'POST', payload)
        .then(res => {
          return (res.status === 'error')
          ? reject(res.message)
          : resolve(res)
        })
        .catch(err => reject(err))
    })
  }

  static chargeCard(cardDetails) {
    const requestChargeData = this.serializeCardDetails(cardDetails)
    return this.processPayment(GET_CHARGED_URL, this.getPayload(requestChargeData))
  }  
  
  static chargeAccount(accountDetails) {
    const requestChargeData = this.serializeAccountDetails(accountDetails)
    return this.processPayment(GET_CHARGED_URL, this.getPayload(requestChargeData))   
  }

  static validateCharge(validatePaymentDetails) {
    const { otp, currentTab, ...rest } = validatePaymentDetails;
    const url = currentTab === 'CARD' ? VALIDATE_CARD_URL : VALIDATE_ACCOUNT_URL

    return this.processPayment(url, 
      { ...rest, 'otp': parseFloat(otp) }
    )  
  }
}

export default RaveApi;
