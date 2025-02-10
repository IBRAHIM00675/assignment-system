module.exports = (sequelize, DataTypes) => {
    const Assignment = sequelize.define("Assignment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users', 
                key: 'user_id',
            },
            allowNull: false,
        },
        file_path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        uploaded_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'assignments',
        timestamps: true
    });

    Assignment.associate = (models) => {
        Assignment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return Assignment;
};