import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'

import { ConfigContext } from '../../context/ConfigContext';
import { UserContext } from '../../context/UserContext';
import { Table } from 'flowbite-react';

const TaskTimeRegistrations = ({ taskId }) => {
	const { baseURL } = useContext(ConfigContext);
	const { user } = useContext(UserContext)
	const tenantBaseURL = `${baseURL}/${user.tenant_id}`;
	const imageSrc = `${baseURL}/uploads/`

	const [timeRegistrations, setTimeRegistrations] = useState([])
	const [displayCount, setDisplayCount] = useState(2)

	const handleLoadMore = () => {
		setDisplayCount(prevCount => prevCount + 10)
	}

	const fetchTimeRegistrations = async (taskId) => {
		try {
			const response = await axios.get(`${tenantBaseURL}/time-registrations/time-registered/${taskId}`)

			setTimeRegistrations(response.data)
		} catch (error) {
			console.error('Failed to fetch registered time(s)', error)
		}
	}

	useEffect(() => {
		fetchTimeRegistrations(taskId)
	}, [taskId])

	return (
		<div className='mt-5 py-5 px-5 border-0 rounded-lg bg-stone-100 relative flex flex-col w-full outline-none focus:outline-none'>
			<h2 className='font-bold mb-5 text-lg'>Task time registrations ({timeRegistrations.length})</h2>

			<section className='flex gap-10'>
				<span className='w-full'>
					{timeRegistrations && timeRegistrations.length > 0 ? (
						<>
							<Table className='relative'>
								<Table.Head>
									<Table.HeadCell className='text-left text-black bg-white py-3 px-5'>
										Time registered
									</Table.HeadCell>
									<Table.HeadCell className='text-left text-black bg-white py-3 px-5'>
										Date
									</Table.HeadCell>
									<Table.HeadCell className='text-left text-black bg-white py-3 px-5'>
										User
									</Table.HeadCell>
								</Table.Head>

								<Table.Body>
									{timeRegistrations.slice(0, displayCount).map((time) => (
										<Table.Row key={time._id}>
											<Table.Cell className='py-3 px-5'>
												<p className='text-xs font-bold text-black'>{time.timeRegistered}</p>
											</Table.Cell>
											<Table.Cell className='py-3 px-5'>
												<p className='text-xs'>{time.currentTime}</p>
											</Table.Cell>
											<Table.Cell className='py-3 px-5 flex items-center gap-2'>
												<img className='w-[25px] h-[25px] object-cover object-center rounded' src={`${imageSrc}${time.userId.profileImage}`} />
												<p className='text-xs'>{time.userId.username}</p>
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>

							{displayCount < timeRegistrations.length && (
								<div>
									<button
										onClick={handleLoadMore}
										className="mt-5 rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer bg-white w-full">
										Show all
									</button>
								</div>
							)}
						</>
					) : (
						<p>No results found.</p>
					)}
				</span>
			</section>
		</div >
	)
}

export default TaskTimeRegistrations