'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PerfumeDetail extends Model {
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
    PerfumeDetail.init(
        {
            perfumeIdx: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            story: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            abundanceRate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment:
                    '0: None, 1: 오 드 코롱, 2: 코롱, 3: 오 드 뚜왈렛, 4: 오 드 퍼퓸, 5: 퍼퓸',
            },
            volumeAndPrice: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            modelName: 'PerfumeDetail',
            timestamps: true,
            underscored: true,
            sequelize,
        }
    );
    return PerfumeDetail;
};
