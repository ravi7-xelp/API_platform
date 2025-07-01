module.exports = (dbConnect, Sequelize) => {

    const Tutorial = dbConnect.define("tutorial", {
    
    title: {
    
    type: Sequelize.STRING
    
    },
    
    description: {
    
    type: Sequelize.STRING
    
    },
    
    published: {
    
    type: Sequelize.BOOLEAN
    
    }
    
    });
    
    
    return Tutorial;
    
    };