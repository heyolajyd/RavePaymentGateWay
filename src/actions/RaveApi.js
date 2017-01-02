import NetworkInfo from 'react-native-network-info'
import cryptico from 'cryptico'

const ROOT_URL = 'http://flw-pms-dev.eu-west-1.elasticbeanstalk.com'
const BANKS_URL = '/banks'
const GET_CHARGED_URL = '/flwv3-pug/getpaidx/api/charge'
const VALIDATE_CHARGE_URL =  '/flwv3-pug/getpaidx/api/validate'

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
    throw (err);
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
  
  static getAllBanks() {
    return processRequest(BANKS_URL, 'GET')
  }
  
  static serializeCardDetails(cardDetails) {
    const { cardno, expirydate, ...rest } = cardDetails
    const datesArr = getExpiryDate(expirydate)
    
    return {
      IP,
      cardno: getCardNumber(cardno),
      expirymonth: datesArr[0],
      expiryyear: datesArr[1],
      meta: [],
      currency: 'NGN',
      country: 'Nigeria',
      ...rest
    }
  }
  
  static serializeAccountDetails(accountDetails) {
    return {
      IP,
      meta: [],
      currency: 'NGN',
      country: 'Nigeria',
      narration: null,
      passcode: null,
      payment_type:'account',
      ...accountDetails
    }
  }
  
  static getPayload(requestChargeData) {
    return {
      PBFPubKey: requestChargeData.PBFPubKey,
      client   : cryptico.encrypt(JSON.stringify(requestChargeData), this.PublicKey).cipher
    }  
  }
  
  static chargeCard(cardDetails) {
    return new Promise((resolve, reject) => {
      // Simulate server-side validation
      if (getCardNumber(cardDetails.cardno).length < 16) {
        reject(`Card number must be 16 characters.`);
      }

      if (getExpiryDate(cardDetails.expirydate).join('').length < 3) {
        reject(`Invalid card expiry date.`);
      }

      if (cardDetails.cvv.length !== 3) {
        reject(`CVV must be at 3 characters`);
      }
      
      const requestChargeData = this.serializeCardDetails(cardDetails)
      processRequest(GET_CHARGED_URL, 'POST', this.getPayload(requestChargeData))
      .then(res => {
        (res.status == 'error')
        ? reject(res.message)
        : resolve(res)
      })
      .catch(err => reject(err));
    });
  }
  
  static chargeAccount(accountDetails) {
    return new Promise((resolve, reject) => {
      if (accountDetails.accountnumber.length < 1) {
        reject(`Account Number is required.`);
      }
      const requestChargeData = this.serializeAccountDetails(accountDetails)
      processRequest(GET_CHARGED_URL, 'POST', this.getPayload(requestChargeData))
      .then(res => {
        (res.status == 'error')
        ? reject(res.message)
        : resolve(res)
      })
      .catch(err => reject(err));
    });    
  }
}

export default RaveApi;
