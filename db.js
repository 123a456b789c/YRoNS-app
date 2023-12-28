const Sequelize = require('sequelize');

const db  = new Sequelize('app', 'app', 't45wrbtr%tzga32!', {
	host: "95.138.193.160",  
dialect: 'mariadb',
  dialectOptions: {
    // Your mariadb options here
    // connectTimeout: 3000
  }
});


async function testConnection() {
    try {
        db.authenticate();
        db.sync({  force: false });
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}

const user = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    bio: {
        type: Sequelize.STRING,
        allowNull: true
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    },
    school: {
        type: Sequelize.STRING,
        allowNull: true
    },
    project: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    d6_Identifier: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    passkey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    isStaff: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
})
 
const passkey = db.define('passkey', {
    passkey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    hasBeenUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
})

const project = db.define('project', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    school: {
        type: Sequelize.STRING,
        allowNull: true
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

const school = db.define("school", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    },
    createdAt: false,
    updatedAt: false
})

const country = db.define("country", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: false,
    updatedAt: false
})

const map_place = db.define("map_place", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    longi: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    createdAt: false,
    updatedAt: false
})

const event = db.define("event", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    start_date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    end_date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    place: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: false,
    updatedAt: false
})

const telegramId = db.define("telegramId", {
    telegramId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: false,
    updatedAt: false
})

const message = db.define("message", {
    time: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    prior: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    useremail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    answer: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    createdAt: false,
    updatedAt: false
})
    

const qnamessage = db.define("qnamessage", {
    message: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    school: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    sender: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    }
})

const contacttransfer = db.define("contacttransfer", {
    fromc: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    toc: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    }
})


module.exports = {
    testConnection,
    telegramId,
    user,
    message,
    passkey,
    project,
    school,
    event,
    country,
    map_place,
    qnamessage,
    contacttransfer
}
