const bitcoin = require('bitcoinjs-lib');
const coininfo = require('coininfo');
const wif = require('wif');
const ecpair = require('ecpair');
const tinysecp = require('tiny-secp256k1');
const bip39 = require('bip39');
//const bip32 = require('bip32');
//const BIP32Factory = require('bip32').default;
//const bip32 = BIP32Factory(tinysecp) 
const bip32 = require('bip32').default(tinysecp);

const network = coininfo('MONA').toBitcoinJS();
network.messagePrefix = ''; //hack

const path = `m/49'/0'/0'/0` // テストネットなら m/49'/1'/0'/0 
const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);

// TypeError: bip32.fromSeed is not a function
const root = bip32.fromSeed(seed, network);

const account = root.derivePath(path);
const node = account.derive(0).derive(0);
const address = bitcoin.payments.p2pkh({ pubkey: node.publicKey, network: network }).address;

console.log(`----- ランダムにニーモニックを作成しそこから鍵やアドレスを作る -----
Mnemonic: ${mnemonic}
address:  ${address}
WIF:      ${node.toWIF()}
Public:   ${node.publicKey.toString('hex')}
Private:  ${node.privateKey.toString('hex')}`);

makeFromMnemonic(mnemonic)
function makeFromMnemonic(mnemonic) {
    console.log('----- ニーモニックから鍵やアカウントを作成する -----')
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);
    const account = root.derivePath(path);
    const node = account.derive(0).derive(0);
    const address = bitcoin.payments.p2pkh({ pubkey: node.publicKey, network: network }).address;
    console.log(`Mnemonic: ${mnemonic}
address:  ${address}
WIF:      ${node.toWIF()}
Public:   ${node.publicKey.toString('hex')}
Private:  ${node.privateKey.toString('hex')}`);

}

/*
const ECPair = ecpair.ECPairFactory(tinysecp)
const key = ECPair.makeRandom()
console.log(`公開鍵：${key.publicKey.toString('hex')}`)
console.log(`秘密鍵：${key.privateKey.toString('hex')}`)
const privateKey = Buffer.from(key.privateKey.toString('hex'), 'hex')
const WIF = wif.encode(128, privateKey, true)
console.log(`WIF：${WIF}`)
const ADDRESS = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network }).address
console.log(`アドレス：${ADDRESS}`)

console.log(`----- WIFから復元する -----`)
fromWif(WIF)
function fromWif(w) {
    const sameKey = ECPair.fromWIF(w)
    console.log(`公開鍵：${sameKey.publicKey.toString('hex')}`)
    console.log(`秘密鍵：${sameKey.privateKey.toString('hex')}`)
    console.log(`WIF：${wif.encode(128, Buffer.from(sameKey.privateKey.toString('hex'), 'hex'), true)}`)
    console.log(`アドレス：${bitcoin.payments.p2pkh({ pubkey: sameKey.publicKey, network }).address}`)
}
*/

