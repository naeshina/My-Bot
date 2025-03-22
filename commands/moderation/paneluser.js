const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const db = require('../../database/index.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panelregist")
    .setDescription("Displays the UCP panel for players"),
  async execute(interaction, client, db) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    const embed1 = new EmbedBuilder()
      .setTitle(title1)
      .setDescription(body1)
      .setColor("#0D6EFD")
      
    const embed2 = new EmbedBuilder()
      .setTitle(`Registration Panel\n__Feature Description & Information__`)
      .setDescription(body2)
      .setImage(db.config.banner)
      .setColor("#0D6EFD")
      .setFooter({
        text: db.config.footer,
        iconURL: db.config.logo,
      })
      .addFields(
        {
          name: `__Register Account Buttons__`,
          value: `> Tombol untuk membuat akun UCP, pastikan anda telah memenuhi persyaratan yang tertera di atas. dan sertakan nomor WhatsApp aktif milik anda untuk proses pengiriman kode OTP atau PIN untuk verifikasi Akun anda.`,
          inline: false
        },
        {
          name: `__PIN/PASSWORD Code Information__`,
          value: `> Mohon untuk tidak menyebarluaskan atau memberikan kode OTP atau PIN akun UCP anda kepada orang lain. jika terjadi hal yang tidak diinginkan pada akun anda, server tidak akan bertanggung jawab.\n\nAdministrator dan Staff tidak pernah meminta PIN atau PASSWORD akun UCP anda. Apabila ada Staff yang melakukan hal tersebut. jangan ragu untuk melaporkannya kepada High Administrator.`,
          inline: false
        }
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("register")
        .setLabel("📝 Register!")
        .setStyle(ButtonStyle.Primary)
    );
    try {
      await interaction.reply({ embeds: [embed1, embed2], components: [row] });
    } catch (err) {
      console.log(err)
      interaction.reply({ content: `Terjadi Kesalahan.`, ephemeral: true })
    }
  },
};

const title1 = `User Control Panel\n__Account Registration Section__`

const body1 = `Selamat datang di Registration Panel GarudaPride! Sarana ini memungkinkan Anda untuk membuat akun UCP yang dapat digunakan untuk login ke dalam server, serta memverifikasi akun UCP yang telah Anda miliki sebelumnya.

Jika Anda baru pertama kali membuat akun UCP di server GarudaPride, harap membaca informasi di bawah ini untuk mengetahui persyaratan yang berlaku dalam membuat akun UCP:

> 1) Pastikan Anda telah membaca dan memahami aturan server GarudaPride.
> 2) Isi formulir pendaftaran dengan data yang akurat dan lengkap.
> Pastikan Anda memiliki Nomor WhatsApp yang valid untuk verifikasi akun.
> 3) Nomor WhatsApp tidak boleh menggunakan **08**, dan harus berformatkan: 
>    **+628xxx** (Indonesia)
>    **+1xxx** (United States)
> 4) Nama akun UCP tidak mengandung kata yang berkaitan dengan SARA, provokatif, dan hal yang berhubungan dengan 18+.
> 5) Nama akun UCP tidak melebihi dari 15 kata dan tidak mengandung simbol-simbol ataupun tanda baca.
> 6) Nama akun UCP bukan nama Character, mohon untuk menghindari menggunakan tanda baca underscore (_) seperti contoh berikut : 
>    **Natasha_Ackerly** (Salah)
>    **NatashaAckerly** (Benar)

Dengan membuat akun UCP di server GarudaPride, Anda dianggap telah menyetujui aturan dan persyaratan yang berlaku.`

const body2 = `> Merupakan informasi dari fitur yang tersedia di Registration Panel pembuatan akun UCP server GarudaPride. Sebelum membuat akun UCP, pastikan Anda mengetahui fungsi-fungsi dari tombol yang telah tersedia untuk memastikan proses pembuatan akun UCP Anda berjalan lancar dan sukses.`
