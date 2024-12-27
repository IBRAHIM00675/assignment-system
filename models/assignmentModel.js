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
                model: 'User ',  // Ensure this matches the actual User model name
                key: 'id'
            },
            allowNull: false,
        },
        file_path: {
            type: DataTypes.TEXT,  // Use TEXT if file paths can be long
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

    // Associations
    Assignment.associate = (models) => {
        Assignment.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return Assignment;
}