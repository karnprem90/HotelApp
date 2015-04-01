'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * __________________
 *
 *  [2014] - [2015] Top Hat Voyage SAS - Alfred by THV
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Top Hat Voyage SAS and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Top Hat Voyage SAS
 * and its suppliers and may be covered by French and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Top Hat Voyage SAS.
 */

exports.tablet = function(requestdata){

  var alltableData=[];
  for(var i=0; i<requestdata.length; i++){
      var tabletData = {}
      var requesteddata = requestdata[i];
      if(requesteddata.macAddress)
        tabletData.macAddress = requesteddata.macAddress;
      if(requesteddata.fabricant)
        tabletData.fabricant = requesteddata.fabricant;
      if(requesteddata.model)
        tabletData.model = requesteddata.model;
      if(requesteddata.serialNumber)
        tabletData.serialNumber = requesteddata.serialNumber;
      if(requesteddata.partNumber)
        tabletData.partNumber = requesteddata.partNumber;
      if(requesteddata.osVersion)
        tabletData.osVersion = requesteddata.osVersion;
      if(requesteddata.softwareVersion)
        tabletData.softwareVersion = requesteddata.softwareVersion;
      if(requesteddata.batchProd)
        tabletData.batchProd = requesteddata.batchProd;
      if(requesteddata.warrantyBeginning)
        tabletData.warrantyBeginning = new Date(requesteddata.warrantyBeginning);
      if(requesteddata.warrantyDuration)
        tabletData.warrantyDuration = requesteddata.warrantyDuration;
      if(requesteddata.pointDeliveryDate)
        tabletData.pointDeliveryDate = new Date(requesteddata.pointDeliveryDate);
      if(requesteddata.functionalStatus)
        tabletData.functionalStatus = requesteddata.functionalStatus;
      if(requesteddata.lifecycleStatus)
        tabletData.lifecycleStatus = requesteddata.lifecycleStatus;
      if(requesteddata.ownerShip)
        tabletData.ownerShip = requesteddata.ownerShip;
      if(requesteddata.accountIncharge)
        tabletData.accountIncharge = requesteddata.accountIncharge;
      if(requesteddata.dateOfCreation)
        tabletData.dateOfCreation = new Date(requesteddata.dateOfCreation);
     alltableData.push(tabletData);
  }
 return alltableData;
};