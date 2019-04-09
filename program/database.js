const mysql = require('mysql');
const Private = require('./private');
const user = Private.user;
const password = Private.password;
const host = Private.host;

class Database {
    /* Create new connection pool upon construction */
    constructor(){
        this.connectionPool = mysql.createPool({
            host:host,
            user:user,
            password:password
        });
    }
    query(sql, args){
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) { return reject(error); }

                connection.query(sql, args, (error, result) => {
                    connection.release();

                    if (error) { return reject(error); }

                    resolve(result);
                });
            });
        });
    }
    /* Add new Discord channel to DB */
    async AddChannel(channelID){
        let sql = "SELECT COUNT(*) as count FROM CSGONewsBot.channels WHERE channelID = ?";
        let args = [channelID];

        let result = await this.query(sql, args);

        if (result[0].count === 0) {
            sql = "INSERT INTO CSGONewsBot.channels (channelID) VALUES (?)";
            await this.query(sql, args);
            return "Channel successfully added!";
        } else { return "Channel already added!" }
    }
    /* Remove Discord channel from DB */
    async RemoveChannel(channelID) {
        let sql = "DELETE FROM CSGONewsBot.channels WHERE channelID = ?";
        let args = [channelID];

        await this.query(sql, args);
        return "Channel successfully removed.";
    }
    /* Get all stored Discord channels from DB */
    async GetChannels(){
        let sql = "SELECT (channelID) FROM CSGONewsBot.channels";
        let result = await this.query(sql, []), output = [];

        Object.keys(result).forEach((key) => {
            let row = result[key];
            output.push(row.channelID);
        });

        return output;
    }
    /* Check if news article has already been shown */
    async NewsArticleExists(title){
        let sql = "SELECT COUNT(*) as count FROM CSGONewsBot.newsitems WHERE title = ?";
        let args = [title];

        let result = await this.query(sql, args);
        return result[0].count > 0;
    }
    /* Add news article to list of already shown articles */
    async AddNewsArticle(title){
        let sql = "INSERT INTO CSGONewsBot.newsitems(title) VALUES (?)";
        let args = [title];

        return await this.query(sql, args);
    }
}

module.exports.Database = Database;