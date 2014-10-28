#!/usr/bin/perl

use strict;
use warnings;
use utf8;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;
use utf8;

use lib "/home/nina/perl5/lib/perl5";

use JSON;

my $cgi = CGI->new;

my $data = eval { JSON->new->utf8->decode($cgi->param("POSTDATA")) };

my $action = $data->{"action"};

my ($json, $statement, $sth);

my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

$dbh->do(qq{SET NAMES 'utf8'}) or die $dbh->errstr;

if ($action eq 'add') {

	my $user_id = $data->{"user_id"};

	my $list_name = $data->{"list_name"};

	my $items = $data->{"items_to_add"};

	$statement = qq{INSERT INTO profiles (user_id, name) VALUES (?, ?)};
	$sth = $dbh->prepare($statement)
	  or die $dbh->errstr;

	$sth->execute($user_id, $list_name) or die $sth->errstr;

	my $list_id = $dbh->{'mysql_insertid'};

	foreach my $key (keys %{$items}) {

		$statement = qq{INSERT INTO todos (list_id, name, status) VALUES (?, ?, ?)};
		$sth = $dbh->prepare($statement)
		  or die $dbh->errstr;

		$sth->execute($list_id, $key, $items->{$key}) or die $sth->errstr;

	}

	$json = qq{{"user_id" : "$user_id"}};

}

elsif ($action eq "update") {

	my $user_id = $data->{"user_id"};

	my $list_id = $data->{"list_id"};

	my $items_to_add = $data->{"items_to_add"};
	my $items_to_delete = $data->{"items_to_delete"};
	my $items_to_update = $data->{"items_to_update"};

	foreach my $key (keys %{$items_to_add}) {

		$statement = qq{INSERT INTO todos (list_id, name, status) VALUES (?, ?, ?)};
		$sth = $dbh->prepare($statement)
		  or die $dbh->errstr;

		$sth->execute($list_id, $key, $items_to_add->{$key}) or die $sth->errstr;

	}

	foreach my $key (keys %{$items_to_delete}) {

		$statement = qq{DELETE FROM todos WHERE id=?};
		$sth = $dbh->prepare($statement)
		  or die $dbh->errstr;

		$sth->execute($key) or die $sth->errstr;

	}

	foreach my $key (keys %{$items_to_update}) {

		$statement = qq{UPDATE todos SET status=? WHERE id=?};
		$sth = $dbh->prepare($statement)
		  or die $dbh->errstr;

		$sth->execute($items_to_update->{$key}, $key) or die $sth->errstr;

	}


	$json = qq{{"user_id" : "$user_id"}};

}

elsif ($action eq 'select') {
	my $list_id = $data->{"list_id"};

	$statement = qq{SELECT * FROM todos WHERE list_id=?};
	$sth = $dbh->prepare($statement)
	  or die $dbh->errstr;

	$sth->execute($list_id) or die $sth->errstr;

	my $hash_result = $sth->fetchall_hashref('id');

	$json = eval { JSON->new->encode($hash_result) };
}

print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;