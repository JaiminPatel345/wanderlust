import React from 'react';
import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Badge,
    Title
} from "@tremor/react";
import { EyeIcon, StarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

const ListingStats = ({ listings }) => {
    return (
        <Card>
            <Title>Listing Statistics</Title>
            <Table className="mt-4">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Listing</TableHeaderCell>
                        <TableHeaderCell>Views</TableHeaderCell>
                        <TableHeaderCell>Reviews</TableHeaderCell>
                        <TableHeaderCell>Rating</TableHeaderCell>
                        <TableHeaderCell>Engagement</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {listings.map((listing) => (
                        <TableRow key={listing.listingId}>
                            <TableCell>
                                <Text>{listing.title}</Text>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                    <Text>{listing.views}</Text>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
                                    <Text>{listing.reviews}</Text>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <StarIcon className="h-5 w-5 text-yellow-400" />
                                    <Text>{listing.rating.toFixed(1)}</Text>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Badge color="blue">
                                        {listing.engagement.bookmarks} Bookmarks
                                    </Badge>
                                    <Badge color="green">
                                        {listing.engagement.inquiries} Inquiries
                                    </Badge>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};

export default ListingStats; 