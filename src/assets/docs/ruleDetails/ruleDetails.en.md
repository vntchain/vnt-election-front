# VNT Super Node Voting Rules

## 1. How to Vote

1） A small amount of VNT is consumed as a transaction fee when voting, and VNT is required to be frozen. The number of votes is based on the amount of collateral at the time of voting.

2） You can vote for up to 30 different nodes.

3） You can vote again after 24 hours of voting.

4） There is no direct benefit from voting, but voting is for the common interests of the VNT community. Please treat your voting rights seriously and build the development of the VNT ecosystem together.

<br>

## 2. VNT Frozen

1) Before voting, voters need to freeze VNT. There is no limit on the number of VNT frozen, but it can only be a positive integer. At the same time, the number of votes is proportional to the VNT frozen.

2) The frozen VNT can only be unfrozen after 24 hours of freezing, and it will be credited immediately after being released.

3) Calculation of votes obtained by freezing VNT: <br>
&nbsp;&nbsp;&nbsp;VNT votes are calculated using a half-life method, which can reduce the impact of no longer having the corresponding VNT after voting. For example, A initially voted with 10 VNTs and cast 10 votes. After one year, the value of this part has become 5 votes, and then another 2.5 years. Although A no longer owns 10 VNTs, as time goes by, A's votes also disappear.

&nbsp;&nbsp;&nbsp;The half-life is generally calculated by decaying the value over time. For the huge number of votes, the half-life calculation of the votes already cast has to be performed every time. The calculation amount is huge, which will cause the execution of the contract to be very time-consuming.

&nbsp;&nbsp;&nbsp;VNT adopts the way of relative attenuation. If there are now 10 VNTs, they can be converted into 10 votes. After one year, 10 VNTs can be converted into **`10*2`** votes. After another year, 10 VNT can be converted into **`10*2*2`** votes.

&nbsp;&nbsp;&nbsp;Use the base year and use the year as the cycle. To use relative attenuation, you need to use the base year and use the same baseline to calculate the attenuation. You can use the year that the network was online, such as 2018:
<div align="center">
  <img src="https://raw.githubusercontent.com/vntchain/statics/master/vote/formula1.png" width = "300"  alt="formula1">
</div>

&nbsp;&nbsp;&nbsp;Supports non-period multiple attenuation. For example, it is June 2018, and the number of votes should be:
<div align="center">
  <img src="https://raw.githubusercontent.com/vntchain/statics/master/vote/formula2.jpeg" width = "300"  alt="formula2">
</div>

&nbsp;&nbsp;&nbsp;Definition **eraTimeStamp** is the starting year of the half-life, and it is set to 00:00:00 on January 1, 2019, which is 1546272000, in seconds. We use 52 weeks as the half-life period, that is, **`52*7*24*3600`** seconds. The number of weeks elapsed from the start of the current year divided by 52 gives the half-life coefficient α. The formula is as follows:
<div align="center">
  <img src="https://raw.githubusercontent.com/vntchain/statics/master/vote/formula3.jpeg" width = "500"  alt="formula3">
</div>

<br>

## 3. Vote
&nbsp;&nbsp;1) Voters can only vote once or set a proxy within 24 hours. Voters can vote repeatedly, whichever comes last.

&nbsp;&nbsp;2) Voters can choose up to 30 nodes per vote, and 30 nodes will get the same number of votes.

&nbsp;&nbsp;3) If the voter wants to cancel the current vote, uncheck all nodes and vote for 0 nodes.

<br>

## 4. Proxy
&nbsp;&nbsp;1) Voters can designate proxies to let proxies vote on their behalf. No ordinary voter may be appointed as his proxy.

&nbsp;&nbsp;2) Voters can freeze a certain number of VNTs and then set up an proxy. The number of votes corresponding to these VNTs will accumulate to the number of votes proxied by the proxy, and will be cast to the nodes voted by the proxy.

&nbsp;&nbsp;3) The proxy just selects the nodes for the voters, but does not modify the votes of the voters. When the proxy modifies the voting, all the votes and its proxy will be voted to the new node, and the proxy will recalculate the votes corresponding to its stake, but will not calculate the number of its proxy votes.

&nbsp;&nbsp;4) Voters can turn on the proxy function to become proxies. The proxies cannot designate proxies for multi-level proxies. Turning off proxies can turn back to voters.