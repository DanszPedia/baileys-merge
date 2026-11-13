# dansz v1.19.22

**WhatsApp Web Multi-Device API** — fork Baileys dengan basis Daffa × Alya Ryuu, kompatibilitas CommonJS + ESM, alias pengiriman pesan, interactive/native-flow helpers, community methods, dan add-on VoIP eksperimental.

> Package name: `dansz`  
> Author: `Echa`  
> Version: `1.19.22`  
> Runtime: Node.js `>=20`

## Instalasi

```bash
npm install dansz
```

dansz tetap memakai runtime **CommonJS** pada core karena source utama dari `dansz.zip` memang berupa CJS hasil kompilasi. Paket juga menyediakan entry ESM dan deklarasi TypeScript. Jadi bot CommonJS maupun ESM dapat menggunakan paket yang sama; tidak perlu mengubah seluruh proyek bot menjadi TypeScript.

## Inisialisasi dan login

### CommonJS

```js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('dansz')

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('Scan QR untuk login')
    if (connection === 'open') console.log('dansz connected')
    if (connection === 'close') console.log('Connection closed:', lastDisconnect?.error)
  })

  return sock
}

start().catch(console.error)
```

### ESM

```js
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from 'dansz'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const { version } = await fetchLatestBaileysVersion()
const sock = makeWASocket({ auth: state, version, printQRInTerminal: true })
sock.ev.on('creds.update', saveCreds)
```

## Alias API dansz

Semua API asli tetap dipertahankan. Alias berikut hanya tambahan; `sock.sendMessage()` tetap bekerja seperti sebelumnya.

| Fungsi | Cara pakai | Keterangan |
|---|---|---|
| `sendMessage` | `sock.sendMessage(jid, content, options)` | API asli Baileys/dansz |
| `sendMsg` | `sock.sendMsg(jid, content, options)` | Alias langsung dari `sendMessage` |
| `sendBtn` / `sendBtnV1` | `sock.sendBtn(jid, interactive, options)` | Mengirim payload `interactiveMessage` mentah |
| `sendBtnV2` | `sock.sendBtnV2(jid, data, options)` | Builder tombol ringkas (`id` + `text`) |
| `sendBtnV3` | `sock.sendBtnV3(jid, data, options)` | Native-flow helper dengan validasi dan relay manual |
| `sendBtnV4` | `sock.sendBtnV4(jid, data, options)` | Varian helper lanjutan dengan dukungan thumbnail |
| `sendClassicBtnV1` | `sock.sendClassicBtnV1(jid, data)` | Format tombol klasik |
| `sendListV1` | `sock.sendListV1(jid, data)` | Format list klasik |
| `sendCarouselV1` | `sock.sendCarouselV1(jid, data)` | Native-flow carousel |
| `sendA2UIV1` | `sock.sendA2UIV1(jid, options)` | Widget A2UI |
| `sendWebUIV1` | `sock.sendWebUIV1(jid, html, title)` | HTML WebUI dalam pesan rich response |
| `sendRichMenuV1` | `sock.sendRichMenuV1(jid, data)` | Rich menu |

### 1. Mengirim teks dengan alias

```js
await sock.sendMsg(m.chat, { text: 'hello world' })
```

Kode lama tetap valid:

```js
await sock.sendMessage(m.chat, { text: 'hello world' })
```

### 2. Mengirim interactive/native-flow message mentah

`sendBtn()` menerima object `interactiveMessage` langsung maupun object yang sudah dibungkus dengan properti `interactiveMessage`.

```js
await sock.sendBtn(m.chat, {
  title: 'Hi, ini button dari dansz',
  footer: 'dansz v1.19.22',
  nativeFlowMessage: {
    messageParamsJson: JSON.stringify({
      bottom_sheet: {
        in_thread_buttons_limit: 2,
        divider_indices: [1, 2, 3],
        list_title: 'Pilih menu',
        button_title: 'List Messages'
      }
    }),
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'All Menu',
          id: '.allmenu'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Website',
          url: 'https://example.com'
        })
      }
    ]
  }
})
```

Bentuk wrapper asli juga didukung, termasuk struktur seperti contoh berikut:

```js
await sock.sendBtn(m.chat, {
  interactiveMessage: {
    title: 'Hi im botz by dansz',
    footer: 'dansz forever',
    image: { url: imgThumb },
    nativeFlowMessage: {
      messageParamsJson: JSON.stringify({
        limited_time_offer: {
          text: 'Promo Panel',
          url: 'https://example.com',
          copy_code: 'dansz',
          expiration_time: Date.now() + 60_000
        }
      }),
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'Pilih menu',
            sections: [{
              title: 'Menu utama',
              rows: [{
                header: 'All Menu',
                title: 'Lihat seluruh menu',
                description: 'Daftar perintah bot',
                id: '.allmenu'
              }]
            }]
          })
        }
      ]
    }
  }
})
```

### 3. Mengirim button dengan format singkat

Untuk tombol quick reply umum, gunakan `sendBtnV2`. dansz akan mengonversi `{ id, text }` menjadi format `quick_reply` native-flow.

```js
await sock.sendBtnV2(m.chat, {
  title: 'Pilih salah satu',
  footer: 'dansz',
  buttons: [
    { id: '.menu', text: 'Menu' },
    { id: '.owner', text: 'Owner' },
    { id: '.ping', text: 'Ping' }
  ]
})
```

Format tombol native dari fork lain tetap bisa dipakai:

```js
await sock.sendBtnV2(m.chat, {
  title: 'Aksi',
  buttons: [
    {
      name: 'cta_copy',
      buttonParamsJson: {
        display_text: 'Copy kode',
        copy_code: 'dansz-11922'
      }
    },
    {
      name: 'cta_call',
      buttonParamsJson: {
        display_text: 'Call',
        phone_number: '+6281234567890'
      }
    }
  ]
})
```

### 4. Advanced button helpers (versi 3 dan 4)

Keduanya berasal dari helper Native Flow yang berbeda dari dispatcher bawaan dansz. Gunakan jika membutuhkan konversi dan validasi tambahan.

```js
await sock.sendBtnV3(m.chat, {
  text: 'Pilih fitur',
  footer: 'dansz',
  interactiveButtons: [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: 'Menu', id: '.menu' })
    },
    {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({ display_text: 'Docs', url: 'https://example.com' })
    }
  ]
})
```

```js
await sock.sendBtnV4(m.chat, {
  text: 'Interactive dengan thumbnail',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  interactiveButtons: [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: 'Mulai', id: '.start' })
    }
  ]
}, { forceExternalAdReply: true })
```

### 5. Classic buttons dan list

Ini adalah format pesan klasik (`buttonsMessage` / `listMessage`), bukan native-flow. Client WhatsApp dapat memperlakukan format klasik dan native-flow secara berbeda.

```js
await sock.sendClassicBtnV1(m.chat, {
  text: 'Pilih tombol',
  footer: 'dansz',
  buttons: [
    { buttonId: '.menu', buttonText: 'Menu' },
    { buttonId: '.owner', buttonText: 'Owner' }
  ]
})
```

```js
await sock.sendListV1(m.chat, {
  title: 'Daftar menu',
  description: 'Pilih salah satu menu',
  buttonText: 'Buka daftar',
  sections: [{
    title: 'Umum',
    rows: [
      { title: 'Menu', description: 'Menampilkan menu', rowId: '.menu' },
      { title: 'Ping', description: 'Cek kecepatan bot', rowId: '.ping' }
    ]
  }]
})
```

### 6. Carousel

```js
await sock.sendCarouselV1(m.chat, {
  text: 'Pilih produk',
  footer: 'dansz',
  cards: [
    {
      text: 'Produk A tersedia',
      footer: 'Rp10.000',
      header: { title: 'Produk A', subtitle: 'Paket basic' },
      buttons: [{ type: 'quick_reply', displayText: 'Pilih A', id: '.buy_a' }]
    },
    {
      text: 'Produk B tersedia',
      footer: 'Rp20.000',
      header: { title: 'Produk B', subtitle: 'Paket premium' },
      buttons: [{ type: 'quick_reply', displayText: 'Pilih B', id: '.buy_b' }]
    }
  ]
})
```

Catatan: carousel/native-flow dan rich UI menggunakan format internal WhatsApp. Pengiriman dapat berhasil di server tetapi tampilan penerima bergantung pada versi dan jenis client WhatsApp.

### 7. A2UI, WebUI, dan rich menu

A2UI:

```js
const { A2UI } = require('dansz/rich/a2ui/v1')
const ui = new A2UI()
const title = ui.text('dansz interactive UI', { variant: 'h1' })
const action = ui.button(title, { action: { call: 'openUrl', args: { url: 'https://example.com' } } })
ui.root([title, action])
await sock.sendA2UIV1(m.chat, { a2ui: ui, bodyText: 'Widget dari dansz' })
```

WebUI:

```js
const html = '<!doctype html><html><body><h1>Hello dansz</h1></body></html>'
await sock.sendWebUIV1(m.chat, html, 'dansz WebUI')
```

Rich menu:

```js
await sock.sendRichMenuV1(m.chat, {
  header: { title: 'Menu Bot' },
  body: {
    title: 'Pilih layanan',
    buttons: [{ label: 'Buka website', toast: 'Membuka website' }]
  },
  footer: { text: 'Kunjungi website', url: 'https://example.com' }
})
```

Format WebUI/A2UI/rich menu juga merupakan format khusus WhatsApp. Tidak semua client menjamin render yang sama. Tombol pada rich menu adalah CTA/widget (bukan quick-reply yang mengirim command kembali ke bot). Jangan memasukkan HTML atau script yang tidak dipercaya.

## Komunitas WhatsApp

Metode komunitas dari layer fork Raiden v2.2.5 ditambahkan secara langsung ke socket dansz. Contoh:

```js
// Buat community
const community = await sock.communityCreate('Nama komunitas', 'Deskripsi komunitas')

// Ambil metadata dan daftar grup yang terhubung
const metadata = await sock.communityMetadata(community.id)
const linked = await sock.communityFetchLinkedGroups(community.id)

// Buat grup di dalam community
const subgroup = await sock.communityCreateGroup(
  'Nama subgroup',
  ['6281234567890@s.whatsapp.net'],
  community.id
)

// Invite code / deskripsi
const inviteCode = await sock.communityInviteCode(community.id)
await sock.communityUpdateDescription(community.id, 'Deskripsi baru')
```

Method tambahan yang tersedia meliputi `communityCreateGroup`, `communityLeave`, `communityUpdateSubject`, `communityLinkGroup`, `communityUnlinkGroup`, `communityFetchLinkedGroups`, `communityRequestParticipantsList`, `communityRequestParticipantsUpdate`, `communityParticipantsUpdate`, `communityUpdateDescription`, `communityInviteCode`, `communityRevokeInvite`, `communityAcceptInvite`, `communityGetInviteInfo`, `communityToggleEphemeral`, `communitySettingUpdate`, `communityMemberAddMode`, dan `communityJoinApprovalMode`.

Akses endpoint komunitas bergantung pada kemampuan akun dan perubahan protokol WhatsApp. Tetap tangani error dari setiap method.

## MEX query helper

`executeMexV1` adalah helper query tingkat rendah. `queryId` dan `dataPath` harus berasal dari operasi MEX yang memang diketahui; jangan menebak query ID.

```js
const result = await sock.executeMexV1(
  { /* variables */ },
  'query_id_yang_valid',
  'response_field'
)
```

Bentuk modul juga bisa dipakai manual lewat `const { executeWMexQuery } = require('dansz/mex/v1')`.

## VoIP v1 (eksperimental, opt-in)

Implementasi VoIP dari Luna Baileys 9.0.23 disertakan terpisah agar tidak memengaruhi ukuran/initialisasi core socket. Subpath ini **ESM**. CJS juga bisa memakainya melalui dynamic import.

ESM:

```js
import { VoipClient } from 'dansz/voip/v1'

const voip = new VoipClient({
  // Basis dansz tidak menyertakan LID mapping helper pada signalRepository.
  // Sediakan resolver sendiri dari cache / data LID yang sudah Anda miliki.
  resolveLid: async (pnJid, sock) => myLidResolver(pnJid, sock),
  selfLidJid: '123456789012345@lid' // opsional bila creds.me.lid belum tersedia
})

await voip.connectWithSocket(sock)
const call = await voip.call('6281234567890', {
  durationMs: 120_000,
  audioSource: 'silence' // atau path file / lavfi:<expression>
})
call.on('ringing', () => console.log('ringing'))
call.on('connected', () => console.log('connected'))
call.on('ended', reason => console.log('ended:', reason))
// Untuk mengakhiri panggilan:
call.end()
// Setelah selesai menggunakan VoIP:
voip.disconnect()
```

CommonJS:

```js
const { loadVoipV1 } = require('dansz')
const { VoipClient } = await loadVoipV1()
```

VoIP memerlukan peer dependency `@roamhq/wrtc` dan executable `ffmpeg` pada PATH untuk audio feeder. Dua dependency tersebut tidak dipasang otomatis oleh dansz. Fitur ini tidak dijanjikan berjalan di semua panel/VPS; uji pada environment milik Anda sebelum dipakai. Gunakan hanya untuk komunikasi yang sah dan sesuai ketentuan WhatsApp.

## Fitur core yang dipertahankan

Core `dansz.zip` tidak diganti dengan core fork yang lain. API dasar Baileys/Daffa tetap tersedia, termasuk:

- Multi-device WebSocket, authentication state, QR/login dan event socket.
- Kirim pesan teks, media, dokumen, sticker, kontak, lokasi, poll, dan tipe pesan dasar Baileys yang didukung core.
- Group management, chat, presence, receipts, newsletter/channel, business/catalog, product, dan utility protokol yang sudah ada di basis.
- Dispatcher khusus untuk `interactiveMessage`, payment, product, album, event, poll result, group story, dan rich response.
- Dukungan payload `nativeFlowMessage` dengan `messageParamsJson` dan `buttons`.

`sendMessage` tetap menjadi API utama dan tidak dihapus. Gunakan API alias hanya bila nama yang lebih pendek membantu script bot Anda.

## Dependensi native dan panel Pterodactyl

dansz sengaja **tidak** menjadikan `sharp`, `jimp`, `canvas`, `better-sqlite3`, `ffmpeg-static`, atau `ffprobe-static` sebagai dependency wajib. Dengan demikian instalasi standar tidak memaksa npm membangun modul native tersebut.

Beberapa integrasi media dapat memanfaatkan modul opsional berikut:

| Modul opsional | Kegunaan | Default |
|---|---|---|
| `sharp` | Pemrosesan gambar native | Tidak diinstal otomatis |
| `jimp` | Alternatif pemrosesan gambar berbasis JS | Tidak diinstal otomatis |
| `@roamhq/wrtc` | Transport WebRTC untuk VoIP | Tidak diinstal otomatis |
| `fluent-ffmpeg` | Helper integrasi FFmpeg | Tidak diinstal otomatis |
| `audio-decode` | Dekode audio tambahan | Tidak diinstal otomatis |
| `link-preview-js` | Link preview | Tidak diinstal otomatis |
| `qrcode-terminal` | QR di terminal | Tidak diinstal otomatis |

Metadata `peerDependenciesMeta.optional` digunakan untuk menandai semuanya optional. Bila panel tidak bisa memasang Sharp, biarkan Sharp tidak terpasang atau pasang `jimp` sesuai kebutuhan script; dansz core tetap dapat di-install tanpa Sharp. dansz tidak memaksa downgrade atau menjalankan instalasi native secara otomatis.

Contoh memasang dukungan gambar secara opsional:

```bash
npm install jimp
# atau, pada server yang memang mendukung binary/prebuild Sharp:
npm install sharp
```

## TypeScript

Deklarasi `index.d.ts` disertakan. Core runtime tetap JavaScript dual-module sehingga file bot `.ts`, `.js` ESM, dan `.cjs` dapat menggunakan package yang sama.

```ts
import makeWASocket, { useMultiFileAuthState } from 'dansz'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)
await sock.sendMsg('6281234567890@s.whatsapp.net', { text: 'Hello dari TypeScript' })
```

## Lisensi dan asal fitur

Core dansz tetap membawa lisensi dan atribusi dari basis aslinya. Modul tambahan pihak ketiga memiliki notice terpisah pada `NOTICE-THIRD-PARTY.md` dan folder `licenses/`. Audit integrasi, sumber, dan batas kompatibilitas ada di [`FORK-MERGE-AUDIT.md`](./FORK-MERGE-AUDIT.md).
