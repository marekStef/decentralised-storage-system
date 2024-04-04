---
sidebar_position: 0
---

# Features Suggestions

This project is far from being fully completed. There are multiple areas which can be improved and built upon.

We are including this list so that the reader, you, can either help this project or simply get idea of where some things could be moving.

## Cloud Sharing

As you already know, Data Storage's data are stored locally, on the admin's computer. Therefore, due to the architecture of current networks (which do not allow direct communication between computers), it's not possible to share data with other peer Data Storages. This presents a large drawback as there are multiple scenarios where this could be beneficial.

There could be a cloud sharing service running on a publicly accessible network so that two distinct local decentralised systems could share some data.

### Possible Use Case

Among the example apps, we have a [calendar app](../../example-apps/calendar-pro/introduction).

There could be a scenario where you and your colleague want to meet up for some business or any other activity. you have multiple types of events such as events for work, hobby, etc. and you want to reach agreement as to when to meet. this can be pretty tedious task as you are available on monday 4 pm, he is not, he is available on tuesday, 5pm but you are not. You know this.

Thanks to this calendar, the calendar could create a special time limited view instance for showing next week's events. The view would however, only show that you have something already arranged at a given date but would not show what specifically.

Imagine a scenario in which you and your colleague are trying to schedule a meeting for business or another activity. You each have various calendar events categorized by type, such as work-related events or hobbies, complicating the process of finding a mutually convenient time. For instance, you might be free on Monday at 4 pm, but your colleague is not, and while they are available on Tuesday at 5 pm, you are booked. This situation can quickly become frustrating as you attempt to synchronize your schedules.

To alleviate this, the calendar app can generate a special, time-limited **view instance** for the upcoming week. This feature selectively displays your availability without divulging the specifics of your engagements. Essentially, it will indicate that you are unavailable at certain times, but it won’t reveal why. 

Your Data Storage system would be aware of these shared **View Instances** and would initiate synchronisations of data if any new Data Storage events were created even after the **View Instance** was shared.

## Listeners

When new events are stored, there are scenarios, where some action can be taken based on the immediate knowledge of these new events. Therefore, a new concept called **Listeners** could be added to the system. A **Listener** would be a piece of code ( similar to **View Template** ), which would be automatically executed when some new event in interest would be added/modified/deleted etc.

This would allow a broad range of new possibilities. 

Consider a hypothetical small business that utilizes a bespoke warehouse management application for tracking inventory. The business has a critical need to maintain optimal stock levels automatically.

By integrating Event Listeners into their warehouse application, it becomes possible to automate the restocking process efficiently. For instance, as warehouse staff scan items during the dispatch process, registered listeners within the app can instantaneously initiate the procurement of additional stock, ensuring that inventory levels are consistently maintained without manual intervention. This not only streamlines operations but also significantly reduces the potential for human error in inventory management.

## Block Chains

In today's digital age, the integrity and authenticity of data are paramount, especially when such data plays a crucial role in decision-making or when transferred between parties. Here, blockchain technology emerges as a groundbreaking solution, ensuring the immutability and transparency of data. Originally conceived for digital currencies like Bitcoin, blockchain has found applications far beyond, due to its decentralized nature and cryptographic security.

At its core, a blockchain is a distributed database or ledger that is shared among the nodes of a computer network. It stores information in blocks that are linked together in a chain. Once a block is filled with data, it is chained onto the previous block, making the data chained together in chronological order. Crucial to blockchain's security features is the concept of cryptographic hashing, a process that transforms input data of any size into a fixed-size string of characters, which acts as a digital fingerprint of the data. Any alteration to the data changes this hash drastically, making tampering evident.

Implementing blockchain within our system offers a robust method to certify the authenticity and integrity of the data shared between decentralized storages or individuals. By leveraging blockchain, when a piece of data, or an "event" in our context, is created and shared, it can be accompanied by a cryptographic hash. This not only timestamps the data but also securely anchors it to all preceding entries, ensuring any subsequent modification is detectable.

### Example Use Case: Personal Location Sharing

Consider a personal location tracking application designed for employee monitoring during work hours. In such a scenario, employees share their location data with their employer (through [shared view instances](#cloud-sharing)). The challenge here is ensuring the data's integrity, providing assurance to the employer that the shared location information has not been tampered with.

By integrating blockchain into the application, each location data point (an "event") the employee shares is cryptographically signed and chained to previous data points. This creates an immutable record of their movements during work hours. Should the employee attempt to alter their location history retrospectively, such modifications would invalidate the cryptographic chain, thus alerting the employer to the discrepancy.

This blockchain-based approach not only fosters trust between employees and employers but also enhances privacy and control over data. Employees can be assured that only their location during specified hours is shared, and employers receive a tamper-proof record, eliminating doubts about data manipulation.

In summary, blockchain's application within our project isn't just a technological enhancement; it's a paradigm shift towards creating a more secure, transparent, and trustworthy system for sharing and verifying critical data across decentralized platforms.