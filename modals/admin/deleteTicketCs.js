const { deleteReportData } = require("../../functions/reportHandler");

module.exports = {
  customId: "deleteTicketCs",
  async execute(interaction) {
    await interaction.reply({
      content: "Character Story ticket deleted successfully!",
      ephemeral: true,
    });

    const channel = interaction.channel;
    const userId = interaction.user.id;

    deleteReportData(userId);

    await channel.delete().catch((error) => {
      console.error("Failed to delete channel:", error);
    });
  },
};
