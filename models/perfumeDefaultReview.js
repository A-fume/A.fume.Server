'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PerfumeDefaultReview extends Model {
        static associate(models) {
            this.belongsTo(models.Perfume, {
                foreignKey: {
                    name: 'perfumeIdx',
                    allowNull: false,
                    primaryKey: true,
                },
                as: 'Perfume',
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            });
        }
    }
    PerfumeDefaultReview.init(
        {
            perfumeIdx: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            rating: {
                type: DataTypes.FLOAT,
                allowNull: false,
                comment: '0.5 ~ 5.0',
            },
            seasonal: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '{spring}/{summer}/{fall}/{winter}',
            },
            gender: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '{male}/{neutral}/{female}',
            },
            sillage: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '{light}/{medium}/{heavy}',
            },
            longevity: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '{veryWeak}/{weak}/{normal}/{strong}/{veryStrong}',
            },
        },
        {
            modelName: 'PerfumeDefaultReview',
            timestamps: true,
            underscored: true,
            sequelize,
        }
    );
    return PerfumeDefaultReview;
};
