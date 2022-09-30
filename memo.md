bip39でモナコインアドレスを作る

　`bip39`, `bip32`, `bitcoinjs-lib`でモナコインアドレスを作った。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Node.js.bip39.bip32.CreateAddress.20220930162500

## 実行

```sh
git clone https://github.com/ytyaru/Node.js.bip39.bip32.CreateAddress.20220930162500
node index.js
```

## 結果

```sh
----- ランダムにニーモニックを作成しそこから鍵やアドレスを作る -----
Mnemonic: together anchor sun horse escape that adjust liquid fog push public decide
address:  MTV5aGR2iUtpwZk8eF5iMZ2RoCdGLzZ1G5
WIF:      TAw58AXrzKPfiEqQnrdgEAjuJWN6QB2z6XmMWckxghbybHacknJG
Public:   0258554521e5adbd84bec56d4d48af9efd8a63a21f2ba733f19066622e526a39a0
Private:  eb25983847d3e896dbb0ca87bbf597c2747fc4904683e68b74988974e2bef8d6
----- ニーモニックから鍵やアカウントを作成する -----
Mnemonic: together anchor sun horse escape that adjust liquid fog push public decide
address:  MTV5aGR2iUtpwZk8eF5iMZ2RoCdGLzZ1G5
WIF:      TAw58AXrzKPfiEqQnrdgEAjuJWN6QB2z6XmMWckxghbybHacknJG
Public:   0258554521e5adbd84bec56d4d48af9efd8a63a21f2ba733f19066622e526a39a0
Private:  eb25983847d3e896dbb0ca87bbf597c2747fc4904683e68b74988974e2bef8d6
```

　WIFは[前回][]のとおりで、こいつがあれば秘密鍵も復元できる。ニーモニックもWIFと同じく鍵やWIFも復元できるが、さらに英単語など人間にとって覚えやすい文字列になっている。Mpurseでもアドレスを作成するとき保存しろと言われたやつだと思う。12単語なら`128`、24単語なら`256`エントロピー。この数値は`wif.encode`の第一引数に渡すやつだと思う。

[前回]:ecpairとwifを相互変換してみた

# 情報源

* [bitcoinjs-lib、bip32、bip39を使ってビットコインアドレスを生成する][]
* [bip32][]
* [bip39][]
* [BIP39について調べてみました][]

[bitcoinjs-lib、bip32、bip39を使ってビットコインアドレスを生成する]:https://www.servernote.net/article.cgi?id=generate-bitcoin-address-using-bitcoinjs-lib-bip32-39
[bip32]:https://github.com/bitcoinjs/bip32
[bip39]:https://github.com/bitcoinjs/bip39
[BIP39について調べてみました]:https://tech.bitbank.cc/about-bip39/

　BIP39は以下のようなものらしい。

> 人間がわかる単語を紙と鉛筆でメモを取ることでバックアップができるような仕組み

# プロジェクト作成

```sh
NAME=bip39-address
mkdir $NAME
cd $NAME
npm init -y
npm i bitcoinjs-lib coininfo wif ecpair tiny-secp256k1 bip32 bip39
touch index.js
```

　[bip39][], [bip32][]パッケージを使うのがポイント。

# コード作成

## index.js

```javascript
const bitcoin = require('bitcoinjs-lib');
const coininfo = require('coininfo');
const wif = require('wif');
const ecpair = require('ecpair');
const tinysecp = require('tiny-secp256k1');
const bip39 = require('bip39');
const bip32 = require('bip32').default(tinysecp);

const network = coininfo('MONA').toBitcoinJS();
network.messagePrefix = '';

const path = `m/49'/0'/0'/0` // テストネットなら m/49'/1'/0'/0 
const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
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
```

　アドレスやニーモニックだけでなくWIFや秘密鍵、公開鍵も取得できた。

　[bitcoinjs-lib、bip32、bip39を使ってビットコインアドレスを生成する][]を参考にしたが、そこにあったように以下のようなコードにしたらエラーになった。どうやら`bip32`パッケージのインタフェースが変更されたようだ。

```javascript
const bip32 = require('bip32');
const root = bip32.fromSeed(seed, network);
```
```sh
TypeError: bip32.fromSeed is not a function
```

　そこで[bip32][]のREADMEを参考にして以下のように修正した。

```javascript
const tinysecp = require('tiny-secp256k1');
const bip32 = require('bip32').default(tinysecp);
...
const root = bip32.fromSeed(seed, network);
```

# 所感

　これだけやれば鍵やアドレスまわりのことは何とかなるだろう。次はこの鍵を使って署名したい。

<!--

# 経緯

　[ブラウザでBTC送金トランザクション (segwit対応)][]などの記事をみて、どうやって送金するのか調べていた。すると必ずWIFというやつが出てくる。しかもそれはコードを実行することで生成するのではなく、外部から文字列リテラルか何かで渡されるものらしい。たぶん秘密鍵みたいなものだと当たりをつけ、JavaScriptでどうやってWIFを取得するのか調査した。

[ブラウザでBTC送金トランザクション (segwit対応)]:https://memo.appri.me/programming/btc-tx-on-browser

-->

